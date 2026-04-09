'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AllUsersAttendanceResponse } from '@/types/attendance';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileSpreadsheet, Activity, Search } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

interface AllUsersAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AllUsersAttendanceModal({
  isOpen,
  onClose,
}: AllUsersAttendanceModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [searchTerm, setSearchTerm] = useState('');

  const { data: attendance = [], isLoading, refetch } = useQuery({
    queryKey: ['all-users-attendance', startDate, endDate],
    queryFn: async () => {
      const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      const response = await api.get<AllUsersAttendanceResponse>(
        `/api/v1/attendance/all-users-attendance?startDate=${startStr}&endDate=${endStr}`
      );
      return response.data.data;
    },
    enabled: isOpen,
  });

  const filteredAttendance = attendance.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.deviceUserId.includes(searchTerm)
  );

  const downloadXLSX = () => {
    if (attendance.length === 0) return;

    const worksheetData = attendance.map(record => ({
      'User ID': record.userId,
      'Name': record.name,
      'Device User ID': record.deviceUserId,
      'Date': record.date,
      'Check In': record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm:ss a') : '-',
      'Check Out': record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm:ss a') : '-',
      'Duration (Min)': record.durationMinutes ?? '-',
      'Status': record.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `all_users_attendance_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto font-sans rounded-3xl border-indigo-50 shadow-2xl p-0">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold tracking-tight">
                  Global Attendance Report
                </DialogTitle>
                <DialogDescription className="text-emerald-50 text-lg opacity-90">
                  Daily logs for all personnel in the system
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col lg:flex-row items-end gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-full lg:w-64">
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                label="Start Date"
              />
            </div>
            <div className="w-full lg:w-64">
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                label="End Date"
              />
            </div>
            <div className="w-full lg:flex-1 relative">
              <span className="text-sm font-bold text-slate-700 mb-2 block">Search Personnel</span>
              <Search className="absolute left-3 bottom-3 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search by name or device ID..." 
                className="pl-10 h-11 border-slate-200 focus:border-emerald-500 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button 
                onClick={() => refetch()} 
                className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
              >
                <Activity className="w-4 h-4" />
                Fetch Data
              </Button>
              <Button 
                onClick={downloadXLSX}
                disabled={attendance.length === 0}
                variant="outline"
                className="h-11 px-6 border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export XLSX
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-bold animate-pulse">Generating global report...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-600 py-5 px-8">Name</TableHead>
                    <TableHead className="font-bold text-slate-600 py-5 px-8 text-center">Date</TableHead>
                    <TableHead className="font-bold text-slate-600 py-5 px-8">Check In</TableHead>
                    <TableHead className="font-bold text-slate-600 py-5 px-8">Check Out</TableHead>
                    <TableHead className="font-bold text-slate-600 py-5 px-8">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-600 py-5 px-8">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record, idx) => (
                      <TableRow key={idx} className="hover:bg-emerald-50/30 border-slate-50 transition-colors">
                        <TableCell className="py-5 px-8">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{record.name}</span>
                            <span className="text-xs text-slate-400 font-medium">Device ID: {record.deviceUserId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 px-8 text-center font-bold text-slate-600">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="py-5 px-8 text-slate-600 font-medium">
                          {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : (
                            <span className="text-slate-300">--:--</span>
                          )}
                        </TableCell>
                        <TableCell className="py-5 px-8 text-slate-600 font-medium">
                          {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : (
                            <span className="text-slate-300">--:--</span>
                          )}
                        </TableCell>
                        <TableCell className="py-5 px-8">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                            record.status === 'PRESENT' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {record.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 py-5 px-8 font-mono">
                          {record.durationMinutes ? `${record.durationMinutes}m` : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-24 bg-white">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-slate-50 p-4 rounded-full">
                            <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-lg">No global records found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
