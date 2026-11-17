
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const axios = require("axios");
const crypto = require("crypto");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const PAYSTACK_SECRET_KEY = defineSecret("PAYSTACK_SECRET_KEY");

const PAYSTACK_CALLBACK_URL = defineString("PAYSTACK_CALLBACK_URL", {
  default:
    "https://us-central1-elimu-database.cloudfunctions.net/paystackCallback",
});

const PAYSTACK_CURRENCY = defineString("PAYSTACK_CURRENCY", {
  default: "KES",
});

const PAYSTACK_API = "https://api.paystack.co";

function getSecret() {
  return (
    PAYSTACK_SECRET_KEY.value() ||
    process.env.PAYSTACK_SECRET_KEY ||
    ""
  ).trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
}

function getPaystackErrorMessage(err) {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "An unexpected payment error occurred."
  );
}

async function settleTransaction(reference) {
  const secret = getSecret();

  if (!secret) {
    throw new Error("Paystack secret key is not configured.");
  }

  const verifyRes = await axios.get(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      timeout: 20000,
    }
  );

  const data = verifyRes.data?.data;

  if (!data) {
    throw new Error("Invalid verification response from Paystack.");
  }

  const snapshot = await db
    .collection("feeTransactions")
    .where("reference", "==", reference)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { found: false, status: "Not found" };
  }

  const transactionRef = snapshot.docs[0].ref;

  return db.runTransaction(async (transaction) => {
    const freshSnapshot = await transaction.get(transactionRef);

    if (!freshSnapshot.exists) {
      return { found: false, status: "Not found" };
    }

    const feeTransaction = freshSnapshot.data();

    if (feeTransaction.status !== "Awaiting Payment") {
      return { found: true, status: feeTransaction.status };
    }

    if (data.status === "success") {
      const paidAmount = Number(data.amount) / 100;
      const expectedAmount = Number(feeTransaction.amount);
      const expectedCurrency = feeTransaction.currency || data.currency;

      if (
        data.currency !== expectedCurrency ||
        !Number.isFinite(paidAmount) ||
        paidAmount !== expectedAmount
      ) {
        transaction.update(transactionRef, {
          status: "Needs Review",
          failureReason: `Paid ${paidAmount} ${data.currency}; expected ${expectedAmount} ${expectedCurrency}`,
          paidAmount,
        });

        return { found: true, status: "Needs Review" };
      }

      transaction.update(transactionRef, {
        status: "Pending VC Approval",
        paidAmount,
        channel: data.channel || "",
        paystackTransactionId: data.id || null,
        paymentConfirmedAt: FieldValue.serverTimestamp(),
      });

      return { found: true, status: "Pending VC Approval" };
    }

    if (data.status === "failed") {
      transaction.update(transactionRef, {
        status: "Rejected",
        failureReason: data.gateway_response || "Payment failed",
      });

      return { found: true, status: "Rejected" };
    }

    return { found: true, status: "Awaiting Payment" };
  });
}

exports.paystackInitialize = onRequest(
  {
    secrets: [PAYSTACK_SECRET_KEY],
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Use POST for payment initialization.",
      });
    }

    try {
      const {
        email,
        amount,
        admissionNumber,
        studentUid,
        studentName,
      } = req.body || {};

      const normalizedEmail = String(email || "").trim();
      const normalizedAdmissionNumber = String(admissionNumber || "").trim();
      const payAmount = Number(amount);

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: "Enter a valid student email address.",
        });
      }

      if (!Number.isFinite(payAmount) || payAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Enter a valid payment amount.",
        });
      }

      const amountInSmallestUnit = Math.round(payAmount * 100);

      if (
        !Number.isSafeInteger(amountInSmallestUnit) ||
        amountInSmallestUnit <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "The payment amount is outside the supported range.",
        });
      }

      if (!normalizedAdmissionNumber) {
        return res.status(400).json({
          success: false,
          error: "Admission number is required.",
        });
      }

      const secret = getSecret();

      if (!secret) {
        logger.error("PAYSTACK_SECRET_KEY is not configured.");

        return res.status(500).json({
          success: false,
          error: "Payment service is not configured. Contact the system administrator.",
        });
      }

      const currency = PAYSTACK_CURRENCY.value().trim().toUpperCase();
      const callbackUrl = PAYSTACK_CALLBACK_URL.value().trim();

      logger.info("Initializing Paystack transaction", {
        amount: payAmount,
        amountInSmallestUnit,
        currency,
        callbackUrl,
        admissionNumber: normalizedAdmissionNumber,
      });

      const paystackResponse = await axios.post(
        `${PAYSTACK_API}/transaction/initialize`,
        {
          email: normalizedEmail,
          amount: amountInSmallestUnit,
          currency,
          callback_url: callbackUrl,
          metadata: {
            admissionNumber: normalizedAdmissionNumber,
            studentName: studentName || "Student",
            studentUid: studentUid || "",
            custom_fields: [
              {
                display_name: "Admission Number",
                variable_name: "admission_number",
                value: normalizedAdmissionNumber,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      const responseData = paystackResponse.data?.data;
      const authorizationUrl = responseData?.authorization_url;
      const reference = responseData?.reference;

      if (!authorizationUrl || !reference) {
        logger.error("Paystack returned an incomplete response.", {
          response: paystackResponse.data,
        });

        throw new Error("Paystack did not return a valid checkout link.");
      }

      await db.collection("feeTransactions").add({
        studentUid: studentUid || "",
        admissionNumber: normalizedAdmissionNumber,
        studentName: studentName || "Student",
        amount: payAmount,
        currency,
        paymentMode: "Paystack",
        reference,
        transactionCode: reference,
        status: "Awaiting Payment",
        submittedByAccountant: "Paystack Function",
        submittedAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        authorization_url: authorizationUrl,
        reference,
      });
    } catch (err) {
      logger.error("Paystack initialization failed.", {
        message: err.message,
        status: err.response?.status || null,
        response: err.response?.data || null,
        code: err.code || null,
      });

      return res.status(err.response?.status || 500).json({
        success: false,
        error: getPaystackErrorMessage(err),
      });
    }
  }
);

exports.paystackCallback = onRequest(
  {
    secrets: [PAYSTACK_SECRET_KEY],
  },
  async (req, res) => {
    const reference = String(
      req.query.reference || req.query.trxref || ""
    );

    let title = "Payment status unknown";
    let message = "We could not read your payment reference.";

    try {
      if (reference) {
        const result = await settleTransaction(reference);

        switch (result.status) {
          case "Pending VC Approval":
            title = "Payment received";
            message =
              "Thank you. Your payment was confirmed and is now awaiting approval.";
            break;

          case "Awaiting Payment":
            title = "Payment not completed";
            message =
              "We have not received the payment yet. You can close this page and try again.";
            break;

          case "Rejected":
            title = "Payment failed";
            message = "The payment did not go through. Please try again.";
            break;

          case "Needs Review":
            title = "Payment needs review";
            message =
              "Your payment was received but needs to be checked by the accounts office.";
            break;

          default:
            title = "Payment not found";
            message =
              "We could not find this payment. Please contact the accounts office.";
        }
      }
    } catch (err) {
      logger.error("Paystack callback verification failed.", {
        message: err.message,
        response: err.response?.data || null,
      });

      title = "Could not confirm payment";
      message =
        "We could not confirm the payment right now. If money was deducted, contact the accounts office and provide your payment reference.";
    }

    const escapeHtml = (value) =>
      String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[char];
      });

    return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #f8fafc;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 32px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,.06);
    }
    h1 {
      font-size: 20px;
      color: #0f172a;
      margin: 0 0 8px;
    }
    p {
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`);
  }
);

exports.paystackWebhook = onRequest(
  {
    secrets: [PAYSTACK_SECRET_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Use POST.");
    }

    try {
      const secret = getSecret();

      if (!secret) {
        logger.error("PAYSTACK_SECRET_KEY is not configured.");
        return res.status(500).send("Webhook is not configured.");
      }

      const signature = String(
        req.get("x-paystack-signature") || ""
      );

      const expectedSignature = crypto
        .createHmac("sha512", secret)
        .update(req.rawBody)
        .digest("hex");

      const receivedBuffer = Buffer.from(signature, "utf8");
      const expectedBuffer = Buffer.from(expectedSignature, "utf8");

      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        return res.status(401).send("Invalid signature.");
      }

      const event = req.body || {};

      if (event.event === "charge.success" && event.data?.reference) {
        await settleTransaction(event.data.reference);
      }

      return res.status(200).send("OK");
    } catch (err) {
      logger.error("Paystack webhook processing failed.", {
        message: err.message,
        response: err.response?.data || null,
      });

      return res.status(500).send("Webhook processing failed.");
    }
  }
);
