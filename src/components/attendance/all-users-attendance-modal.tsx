'use client';

import { useState, useEffect } from 'react';
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
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // Fetch departments for filtering
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/api/v1/departments');
      return response.data.data;
    },
    enabled: isOpen,
  });

  const { data: attendance = [], isLoading, refetch } = useQuery({
    queryKey: ['all-users-attendance', startDate, endDate, selectedDeptId],
    queryFn: async () => {
      const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      const response = await api.get<AllUsersAttendanceResponse>(
        `/api/v1/attendance/all-users-attendance?startDate=${startStr}&endDate=${endStr}&departmentId=${selectedDeptId}`
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
      'Department': record.departmentName,
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
          {/* Enhanced Filter Bar */}
          <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              {/* Date Column 1 */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Range Start</label>
                <DatePicker 
                  date={startDate} 
                  setDate={setStartDate} 
                />
              </div>

              {/* Date Column 2 */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Range End</label>
                <DatePicker 
                  date={endDate} 
                  setDate={setEndDate} 
                />
              </div>

              {/* Dept Column */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Organization</label>
                <div className="relative">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Search Column */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Personnel Lookup</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input 
                    placeholder="Type name or ID..." 
                    className="pl-12 h-12 border-slate-200 bg-slate-50/50 focus:border-emerald-500 rounded-2xl font-bold placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Column */}
              <div className="flex gap-3 h-12">
                <Button 
                  onClick={() => refetch()} 
                  className="flex-1 h-full bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                >
                  <Activity className="w-4 h-4" />
                  Sync
                </Button>
                <Button 
                  onClick={downloadXLSX}
                  disabled={attendance.length === 0}
                  variant="outline"
                  className="px-5 h-full border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </Button>
              </div>
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
                            <span className="font-bold text-slate-900 leading-tight">{record.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 font-medium">ID: {record.deviceUserId}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">{record.departmentName}</span>
                            </div>
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
