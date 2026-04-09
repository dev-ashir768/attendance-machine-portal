'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/types/auth';
import { UserCheckInOutResponse } from '@/types/attendance';
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
import { Loader2, History, Activity, Clock, Users, Download } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface UserAttendanceModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserAttendanceModal({
  user,
  isOpen,
  onClose,
}: UserAttendanceModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance', user.id, startDate, endDate],
    queryFn: async () => {
      const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
      const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
      const response = await api.get<UserCheckInOutResponse>(
        `/api/v1/attendance/user-checkinout?userId=${user.id}&startDate=${startStr}&endDate=${endStr}`
      );
      return response.data.data;
    },
    enabled: isOpen && !!user.id,
  });

  const attendance = data?.attendance || [];
  const summary = data?.summary;

  const downloadXLSX = () => {
    if (attendance.length === 0) return;

    const worksheetData = attendance.map(record => ({
      'Date': format(new Date(record.date), 'yyyy-MM-dd'),
      'Check In': record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm:ss a') : '-',
      'Check Out': record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm:ss a') : '-',
      'Status': record.status,
      'Duration': record.durationFormatted
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `attendance_${user.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto font-sans rounded-3xl border-indigo-50 shadow-2xl p-0">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold tracking-tight">
                  {user.name}
                </DialogTitle>
                <DialogDescription className="text-indigo-100 text-lg opacity-90">
                  Attendance Analytics & History
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-end gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-full md:w-64">
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                label="Start Date"
              />
            </div>
            <div className="w-full md:w-64">
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                label="End Date"
              />
            </div>
            <Button 
              onClick={() => refetch()} 
              className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Analyze Data
            </Button>
          </div>

          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Sessions', value: summary.totalSessions, icon: Users, color: 'indigo' },
                { label: 'Working Hours', value: summary.totalHours, icon: Clock, color: 'emerald' },
                { label: 'Avg. Duration', value: summary.averageDuration, icon: Activity, color: 'amber' },
                { label: 'Check In/Out', value: `${summary.totalCheckIns}/${summary.totalCheckOuts}`, icon: History, color: 'violet' },
              ].map((item, i) => (
                <div key={i} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-2.5 rounded-xl bg-slate-50 text-indigo-600`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Detailed Log
              </h3>
              <Badge variant="outline" className="rounded-lg px-3 py-1 border-slate-200 text-slate-500 font-bold">
                {attendance.length} Entries Found
              </Badge>
              {attendance.length > 0 && (
                <Button 
                  onClick={downloadXLSX} 
                  variant="outline" 
                  className="h-9 px-4 ml-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download XLSX
                </Button>
              )}
            </div>
            
            <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                  <p className="text-slate-500 font-bold animate-pulse">Fetching records...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-bold text-slate-600 py-5 px-8">Date</TableHead>
                      <TableHead className="font-bold text-slate-600 py-5 px-8">Check In</TableHead>
                      <TableHead className="font-bold text-slate-600 py-5 px-8">Check Out</TableHead>
                      <TableHead className="font-bold text-slate-600 py-5 px-8">Status</TableHead>
                      <TableHead className="text-right font-bold text-slate-600 py-5 px-8">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.length > 0 ? (
                      attendance.map((record) => (
                        <TableRow key={record.id} className="hover:bg-indigo-50/30 border-slate-50 transition-colors">
                          <TableCell className="font-bold text-slate-900 py-5 px-8">
                            {format(new Date(record.date), 'EEE, MMM dd')}
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
                            {record.durationFormatted}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-24 bg-white">
                          <div className="flex flex-col items-center gap-3">
                            <div className="bg-slate-50 p-4 rounded-full">
                              <History className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold text-lg">No records found for this period</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
