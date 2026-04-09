export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  durationMinutes: number;
  durationFormatted: string;
  status: string;
}

export interface AttendanceSummary {
  totalSessions: number;
  totalCheckIns: number;
  totalCheckOuts: number;
  totalHours: string;
  averageDuration: string;
}

export interface UserCheckInOutResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      deviceUserId: string;
      email: string | null;
    };
    period: {
      startDate: string;
      endDate: string;
    };
    attendance: AttendanceRecord[];
    summary: AttendanceSummary;
  };
}

export interface AllUsersAttendanceRecord {
  userId: string;
  name: string;
  deviceUserId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  durationMinutes: number | null;
  status: string;
}

export interface AllUsersAttendanceResponse {
  success: boolean;
  data: AllUsersAttendanceRecord[];
}
