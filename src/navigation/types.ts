export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  StudentTabs: undefined;
  StaffTabs: undefined;
  DevTools: undefined;
};

export type StudentTabParamList = {
  StudentDashboard: undefined;
  StudentPrint: undefined;
  StudentPrinters: undefined;
  StudentProfile: undefined;
  StudentBuyPages: undefined;
  StudentSettings: undefined;
  StudentRoleSwitcher?: undefined;
};

export type StaffTabParamList = {
  StaffDashboard: undefined;
  StaffManagePrinters: undefined;
  StaffManageStudents: undefined;
  StaffReports: undefined;
  StaffSystemLogs: undefined;
  StaffConfiguration: undefined;
  StaffSettings: undefined;
  StaffRoleSwitcher?: undefined;
};

