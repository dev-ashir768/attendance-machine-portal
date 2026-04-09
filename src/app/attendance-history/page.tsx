'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/layout/navbar';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2, Search, Settings2, UserCheck, Download, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserAttendanceModal from '@/components/attendance/user-attendance-modal';
import AllUsersAttendanceModal from '@/components/attendance/all-users-attendance-modal';
import UpdateUserModal from '@/components/users/update-user-modal';
import { User } from '@/types/auth';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedUserForAttendance, setSelectedUserForAttendance] = useState<User | null>(null);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<User | null>(null);
  const [isAllUsersModalOpen, setIsAllUsersModalOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [token, user, router]);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: User[] }>('/api/v1/users');
      return response.data.data;
    },
    enabled: !!token && user?.role === 'ADMIN',
  });

  const downloadUserListXLSX = () => {
    if (users.length === 0) return;

    const worksheetData = users.map(u => ({
      'ID': u.id,
      'Name': u.name,
      'Username': u.username,
      'Email': u.email || '-',
      'Role': u.role
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `user_list_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'User Information',
        accessorKey: 'name',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base">{info.getValue() as string}</span>
            <span className="text-xs text-slate-500 font-medium">ID: {info.row.original.id.substring(0, 8)}...</span>
          </div>
        ),
      },
      {
        header: 'Credentials',
        accessorKey: 'username',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">@{info.getValue() as string}</span>
            <span className="text-xs text-slate-400">{info.row.original.email || 'No email set'}</span>
          </div>
        ),
      },
      {
        header: 'Status & Role',
        accessorKey: 'role',
        cell: (info) => {
          const role = info.getValue() as string;
          return (
            <div className="flex items-center gap-2">
              <Badge 
                variant={role === 'ADMIN' ? 'default' : 'secondary'}
                className={role === 'ADMIN' ? 'bg-indigo-600' : 'bg-slate-100 text-slate-600'}
              >
                {role}
              </Badge>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
              </div>
            </div>
          );
        },
      },
      {
        header: () => <div className="text-right px-4">Management</div>,
        id: 'actions',
        cell: (info) => (
          <div className="flex items-center justify-end gap-2 px-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all rounded-lg"
              onClick={() => setSelectedUserForAttendance(info.row.original)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all rounded-lg"
              onClick={() => setSelectedUserForUpdate(info.row.original)}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!token || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User List</h1>
              <p className="text-slate-500">Manage and view attendance history for all users</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 h-11 border-slate-200 focus:border-indigo-500 transition-all rounded-xl shadow-sm"
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setIsAllUsersModalOpen(true)}
                variant="outline"
                className="h-11 px-6 border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Global Report
              </Button>
              <Button 
                onClick={downloadUserListXLSX}
                variant="outline"
                className="h-11 px-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download Users
              </Button>
            </div>
          </div>

          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="pb-6 bg-white border-b border-slate-50">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">System User Directory</CardTitle>
              </div>
              <CardDescription className="text-slate-500 font-medium">
                Comprehensive list of registered employees and administrative staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                  <p className="text-slate-400 font-bold animate-pulse">Loading Directory...</p>
                </div>
              ) : error ? (
                <div className="text-center py-24 text-rose-500 font-bold">
                  Failed to synchronize user data. Please check connection.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="hover:bg-indigo-50/30 border-slate-50 transition-colors group">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-5 px-6">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-24 text-slate-400 font-bold text-lg">
                          No personnel found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedUserForAttendance && (
        <UserAttendanceModal
          user={selectedUserForAttendance}
          isOpen={!!selectedUserForAttendance}
          onClose={() => setSelectedUserForAttendance(null)}
        />
      )}

      {selectedUserForUpdate && (
        <UpdateUserModal
          user={selectedUserForUpdate}
          isOpen={!!selectedUserForUpdate}
          onClose={() => setSelectedUserForUpdate(null)}
        />
      )}

      <AllUsersAttendanceModal 
        isOpen={isAllUsersModalOpen}
        onClose={() => setIsAllUsersModalOpen(false)}
      />
    </div>
  );
}
