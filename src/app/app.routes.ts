
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },

  // Admin Portal
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.page')
        .then(m => m.AdminDashboardPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/admin-dashboard/home/admin-home.page')
            .then(m => m.AdminHomePage)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/admin-dashboard/students/students.page')
            .then(m => m.StudentsPage)
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/admin-dashboard/teachers/teachers.page')
            .then(m => m.TeachersPage)
      },
      {
        path: 'accountants',
        loadComponent: () =>
          import('./pages/admin-dashboard/accountants/accountants.page')
            .then(m => m.AccountantsPage)
      },
      {
        path: 'parents',
        loadComponent: () =>
          import('./pages/admin-dashboard/parents/parents.page')
            .then(m => m.ParentsPage)
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./pages/admin-dashboard/classes/classes.page')
            .then(m => m.ClassesPage)
      },
      {
        path: 'device-ip',
        loadComponent: () =>
          import('./pages/admin-dashboard/device-ip/device-ip.page')
            .then(m => m.DeviceIpPage)
      },
      {
        path: 'hostel',
        loadComponent: () =>
          import('./pages/admin-dashboard/hostel/hostel.page')
            .then(m => m.HostelPage)
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/admin-dashboard/attendance/attendance.page')
            .then(m => m.AttendancePage)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./pages/admin-dashboard/exams/exams.page')
            .then(m => m.ExamsPage)
      },
      {
        path: 'fees',
        loadComponent: () =>
          import('./pages/admin-dashboard/fees/fees.page')
            .then(m => m.FeesPage)
      },
      {
        path: 'timetable',
        loadComponent: () =>
          import('./pages/admin-dashboard/timetable/timetable.page')
            .then(m => m.TimetablePage)
      },
      {
        path: 'announcements',
        loadComponent: () =>
          import('./pages/admin-dashboard/announcements/announcements.page')
            .then(m => m.AnnouncementsPage)
      },
      {
        path: 'learning-materials',
        loadComponent: () =>
          import('./pages/admin-dashboard/learning-materials/learning-materials.page')
            .then(m => m.LearningMaterialsPage)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin-dashboard/settings/settings.page')
            .then(m => m.SettingsPage)
      },
      {
        path: 'vc',
        loadComponent: () =>
          import('./pages/admin-dashboard/vc/admin-vc.page')
            .then(m => m.AdminVCPage)
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  },

  // Student Portal
  {
    path: 'student',
    loadComponent: () =>
      import('./pages/student-dashboard/student-dashboard.page')
        .then(m => m.StudentDashboardLayoutPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
  path: 'home',
  loadComponent: () =>
    import('./pages/student-dashboard/home/student-home.page')
      .then(m => m.StudentHomePage)
},
      {
        path: 'fees',
        loadComponent: () =>
          import('./pages/student-dashboard/fees/fees.page')
            .then(m => m.FeesPage)
      },
      {
        path: 'register-units',
        loadComponent: () =>
          import('./pages/student-dashboard/register-units/register-units.page')
            .then(m => m.RegisterUnitsPage)
      },
      {
        path: 'hostel-booking',
        loadComponent: () =>
          import('./pages/student-dashboard/hostel-booking/hostel-booking.page')
            .then(m => m.HostelBookingPage)
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./pages/student-dashboard/attendance/attendance.page')
            .then(m => m.AttendancePage)
      },
      {
        path: 'learning-materials',
        loadComponent: () =>
          import('./pages/student-dashboard/learning-materials/learning-materials.page')
            .then(m => m.LearningMaterialsPage)
      },
      {
        path: 'exam-card',
        loadComponent: () =>
          import('./pages/student-dashboard/exam-card/exam-card.page')
            .then(m => m.ExamCardPage)
      },
      { path: 'exam-results',
       loadComponent: () => import('./pages/student-dashboard/exam-results/exam-results.page')
       .then(m => m.ExamResultsPage) 
      },
      { 
      path: 'supplementary-registration', 
      loadComponent: () => import('./pages/student-dashboard/supplementary-registration/supplementary-registration')
      .then(m => m.SupplementaryRegistrationPage) 
     },
     {
       path: 'timetable', loadComponent: () => import('./pages/student-dashboard/timetable/timetable.page')
       .then(m => m.TimetablePage) 
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
