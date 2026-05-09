'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, Building2, Briefcase, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface StatisticsData {
  totals: {
    users: number;
    departments: number;
    designations: number;
  };
  usersPerDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;
  usersPerDesignation: Array<{
    designationId: string;
    designationName: string;
    count: number;
  }>;
}

const CHART_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#d946ef', // fuchsia
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-slate-100">
        <p className="font-black text-slate-900 text-sm mb-1">{label}</p>
        <p className="text-indigo-600 font-bold text-lg">
          {payload[0].value} <span className="text-xs text-slate-400 font-medium">users</span>
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-slate-100">
        <p className="font-black text-slate-900 text-sm mb-1">{payload[0].name}</p>
        <p className="font-bold text-lg" style={{ color: payload[0].payload.fill }}>
          {payload[0].value} <span className="text-xs text-slate-400 font-medium">users</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function StatisticsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [token, user, router]);

  const { data: statistics, isLoading, error } = useQuery<StatisticsData>({
    queryKey: ['user-statistics'],
    queryFn: async () => {
      const response = await api.get('/api/v1/users/statistics');
      return response.data.data;
    },
    enabled: !!token && user?.role === 'ADMIN',
  });

  if (!token || user?.role !== 'ADMIN') {
    return null;
  }

  const departmentData = statistics?.usersPerDepartment?.map((item) => ({
    name: item.departmentName,
    users: item.count,
  })) || [];

  const designationData = statistics?.usersPerDesignation?.map((item, index) => ({
    name: item.designationName,
    value: item.count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  })) || [];

  const summaryCards = [
    {
      label: 'Total Users',
      value: statistics?.totals.users ?? '—',
      icon: Users2,
      gradient: 'from-indigo-600 to-violet-700',
      shadowColor: 'shadow-indigo-200',
      description: 'Active personnel in system',
    },
    {
      label: 'Total Departments',
      value: statistics?.totals.departments ?? '—',
      icon: Building2,
      gradient: 'from-emerald-600 to-teal-700',
      shadowColor: 'shadow-emerald-200',
      description: 'Organizational units',
    },
    {
      label: 'Total Designations',
      value: statistics?.totals.designations ?? '—',
      icon: Briefcase,
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-200',
      description: 'Professional titles',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Accountability Dashboard</h1>
              </div>
              <p className="text-slate-500 font-medium ml-14">Workforce distribution analytics and organizational overview</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <BarChart3 className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="font-bold text-slate-400 animate-pulse tracking-wide uppercase text-xs">Loading Statistics...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-rose-500 font-bold">
              Failed to load statistics. Please check your connection.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Card
                      key={index}
                      className={`rounded-3xl border-none overflow-hidden shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group`}
                    >
                      <div className={`bg-gradient-to-br ${card.gradient} p-7 text-white relative overflow-hidden`}>
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                              <Icon className="w-7 h-7" />
                            </div>
                            <span className="text-white/60 text-xs font-black uppercase tracking-widest">{card.label}</span>
                          </div>
                          <p className="text-5xl font-black tracking-tight">{card.value}</p>
                          <p className="text-white/70 text-sm font-bold mt-2">{card.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users by Department - Bar Chart */}
                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="pb-2 pt-7 px-8">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Users by Department</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-semibold ml-11">Workforce distribution across organizational units</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-6 pt-4">
                    {departmentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <Bar
                            dataKey="users"
                            fill="#6366f1"
                            radius={[12, 12, 0, 0]}
                            maxBarSize={56}
                          >
                            {departmentData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Building2 className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-slate-500 font-bold">No department data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Users by Designation - Pie Chart */}
                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="pb-2 pt-7 px-8">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="bg-violet-50 p-2 rounded-xl text-violet-600">
                        <PieChartIcon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Users by Designation</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-semibold ml-11">Professional role distribution overview</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-6 pt-4">
                    {designationData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={designationData}
                            cx="50%"
                            cy="45%"
                            innerRadius={70}
                            outerRadius={120}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            animationBegin={200}
                            animationDuration={800}
                          >
                            {designationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={40}
                            iconType="circle"
                            iconSize={10}
                            formatter={(value: string) => (
                              <span className="text-xs font-bold text-slate-600">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Briefcase className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-slate-500 font-bold">No designation data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detail Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Table */}
                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 py-6 px-8">
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Department Breakdown</CardTitle>
                    <CardDescription className="text-slate-400 font-semibold">Exact headcount per department</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {departmentData.map((dept, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-8 py-5 hover:bg-indigo-50/30 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                              {dept.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">{dept.users}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">users</span>
                          </div>
                        </div>
                      ))}
                      {departmentData.length === 0 && (
                        <div className="px-8 py-12 text-center text-slate-400 font-bold">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Designation Table */}
                <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 py-6 px-8">
                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Designation Breakdown</CardTitle>
                    <CardDescription className="text-slate-400 font-semibold">Exact headcount per designation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {designationData.map((desig, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-8 py-5 hover:bg-violet-50/30 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: desig.fill }}
                            />
                            <span className="font-bold text-slate-700 group-hover:text-violet-700 transition-colors">
                              {desig.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">{desig.value}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">users</span>
                          </div>
                        </div>
                      ))}
                      {designationData.length === 0 && (
                        <div className="px-8 py-12 text-center text-slate-400 font-bold">No data</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
