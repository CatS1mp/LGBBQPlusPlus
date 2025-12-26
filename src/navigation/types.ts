export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  StudentTabs: undefined;
  StaffTabs: undefined;
};

export type StudentTabParamList = {
  StudentDashboard: undefined;
  StudentPrint: undefined;
  StudentHistory: undefined;
  StudentPrinters: undefined;
  StudentProfile: undefined;
  StudentBuyPages: undefined;
  StudentSettings: undefined;
};

export type StaffTabParamList = {
  StaffDashboard: undefined;
  StaffManagePrinters: undefined;
  StaffManageStudents: undefined;
  StaffReports: undefined;
  StaffSystemLogs: undefined;
  StaffConfiguration: undefined;
  StaffSettings: undefined;
};

