'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Building2, 
  Briefcase, 
  Plus, 
  Trash2, 
  Loader2, 
  Search,
  Users2
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ManagementPage() {
  const queryClient = useQueryClient();
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDesignationName, setNewDesignationName] = useState('');
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [isCreatingDesig, setIsCreatingDesig] = useState(false);

  // Fetch departments
  const { data: departments = [], isLoading: isDeptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/api/v1/departments');
      return response.data.data;
    },
  });

  // Fetch designations
  const { data: designations = [], isLoading: isDesigsLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const response = await api.get('/api/v1/designations');
      return response.data.data;
    },
  });

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;
    
    setIsCreatingDept(true);
    try {
      await api.post('/api/v1/departments', { name: newDepartmentName });
      toast.success('Department created successfully');
      setNewDepartmentName('');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignationName.trim()) return;
    
    setIsCreatingDesig(true);
    try {
      await api.post('/api/v1/designations', { name: newDesignationName });
      toast.success('Designation created successfully');
      setNewDesignationName('');
      queryClient.invalidateQueries({ queryKey: ['designations'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create designation');
    } finally {
      setIsCreatingDesig(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Organization Management</h1>
              <p className="text-slate-500">Manage departments and designations within the system</p>
            </div>
          </div>

          <Tabs defaultValue="departments" className="w-full flex flex-col gap-8">
            <div className="flex justify-center">
              <TabsList className="bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100/50 h-14">
                <TabsTrigger 
                  value="departments" 
                  className="rounded-xl px-8 h-11 font-bold transition-all data-active:bg-white data-active:text-indigo-600 data-active:shadow-lg data-active:shadow-indigo-100"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Departments
                </TabsTrigger>
                <TabsTrigger 
                  value="designations" 
                  className="rounded-xl px-8 h-11 font-bold transition-all data-active:bg-white data-active:text-indigo-600 data-active:shadow-lg data-active:shadow-indigo-100"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Designations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="departments" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Create Department Card */}
                <Card className="lg:col-span-4 rounded-3xl shadow-xl shadow-slate-200/40 border-none overflow-hidden sticky top-24">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Plus className="w-5 h-5" />
                      </div>
                      New Department
                    </CardTitle>
                    <p className="text-indigo-100/80 text-sm mt-2 font-medium"> Create a new organizational unit to categorize your workforce.</p>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <form onSubmit={handleCreateDepartment} className="space-y-6">
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Official Name</label>
                        <Input 
                          placeholder="e.g. Software Engineering" 
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          className="h-12 border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-2xl px-4 transition-all"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isCreatingDept || !newDepartmentName}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                      >
                        {isCreatingDept ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Create Department
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Departments List Card */}
                <Card className="lg:col-span-8 rounded-3xl shadow-2xl shadow-slate-200/30 border-none overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between py-7 px-8">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Department Directory</CardTitle>
                      <CardDescription className="font-semibold text-slate-400 mt-1">Manage and overview active organizational units</CardDescription>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black ring-1 ring-indigo-200/50">
                      {departments.length} ACTIVE
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isDeptsLoading ? (
                      <div className="py-24 flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                          <Building2 className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="font-bold text-slate-400 mt-6 tracking-wide uppercase text-xs">Synchronizing Database...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow className="hover:bg-transparent border-slate-100/50">
                            <TableHead className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Department Name</TableHead>
                            <TableHead className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Creation Date</TableHead>
                            <TableHead className="py-5 px-8 text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Management</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {departments.length > 0 ? (
                            departments.map((dept: any) => (
                              <TableRow key={dept.id} className="hover:bg-indigo-50/20 border-slate-50 group transition-all">
                                <TableCell className="py-5 px-8">
                                  <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 text-slate-600 p-2.5 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                      <Building2 className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-lg group-hover:text-indigo-700 transition-colors">{dept.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5 px-8 text-slate-400 font-medium">
                                  {new Date(dept.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </TableCell>
                                <TableCell className="py-5 px-8 text-right">
                                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="py-32 text-center">
                                <div className="flex flex-col items-center justify-center opacity-40">
                                  <div className="bg-slate-100 p-6 rounded-3xl mb-4">
                                    <Building2 className="w-12 h-12 text-slate-400" />
                                  </div>
                                  <p className="text-slate-500 font-black tracking-tight text-xl">Directory is empty</p>
                                  <p className="text-slate-400 font-medium max-w-[200px] mt-2">Start by adding your first department using the form on the left.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>


            <TabsContent value="designations" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Create Designation Card */}
                <Card className="lg:col-span-4 rounded-3xl shadow-xl shadow-slate-200/40 border-none overflow-hidden sticky top-24">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                        <Plus className="w-5 h-5" />
                      </div>
                      New Designation
                    </CardTitle>
                    <p className="text-slate-300 text-sm mt-2 font-medium">Define professional roles and titles for your organization.</p>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <form onSubmit={handleCreateDesignation} className="space-y-6">
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Job Title</label>
                        <Input 
                          placeholder="e.g. Senior Software Engineer" 
                          value={newDesignationName}
                          onChange={(e) => setNewDesignationName(e.target.value)}
                          className="h-12 border-slate-200 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 rounded-2xl px-4 transition-all"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isCreatingDesig || !newDesignationName}
                        className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                      >
                        {isCreatingDesig ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Create Designation
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Designations List Card */}
                <Card className="lg:col-span-8 rounded-3xl shadow-2xl shadow-slate-200/30 border-none overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between py-7 px-8">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Designation Registry</CardTitle>
                      <CardDescription className="font-semibold text-slate-400 mt-1">Available job titles and positions</CardDescription>
                    </div>
                    <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-black ring-1 ring-amber-200/50">
                      {designations.length} ACTIVE
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isDesigsLoading ? (
                      <div className="py-24 flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-800 animate-spin" />
                          <Briefcase className="w-5 h-5 text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="font-bold text-slate-400 mt-6 tracking-wide uppercase text-xs">Accessing Records...</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow className="hover:bg-transparent border-slate-100/50">
                            <TableHead className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Title</TableHead>
                            <TableHead className="py-5 px-8 font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Creation Date</TableHead>
                            <TableHead className="py-5 px-8 text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Management</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {designations.length > 0 ? (
                            designations.map((desig: any) => (
                              <TableRow key={desig.id} className="hover:bg-slate-50 border-slate-50 group transition-all">
                                <TableCell className="py-5 px-8">
                                  <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 text-slate-600 p-2.5 rounded-2xl group-hover:bg-slate-800 group-hover:text-white transition-all duration-300">
                                      <Briefcase className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 text-lg group-hover:text-slate-900 transition-colors">{desig.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5 px-8 text-slate-400 font-medium">
                                  {new Date(desig.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </TableCell>
                                <TableCell className="py-5 px-8 text-right">
                                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="py-32 text-center">
                                <div className="flex flex-col items-center justify-center opacity-40">
                                  <div className="bg-slate-100 p-6 rounded-3xl mb-4">
                                    <Briefcase className="w-12 h-12 text-slate-400" />
                                  </div>
                                  <p className="text-slate-500 font-black tracking-tight text-xl">Registry is empty</p>
                                  <p className="text-slate-400 font-medium max-w-[200px] mt-2">Start by defining your first professional designation.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
