import React, { useMemo } from 'react';
import { Negotiation, NegotiationStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Users, DollarSign, CheckCircle } from 'lucide-react';

interface DashboardProps {
  negotiations: Negotiation[];
}

export const Dashboard: React.FC<DashboardProps> = ({ negotiations }) => {
  // Aggregation Logic
  const stats = useMemo(() => {
    const totalAmount = negotiations.reduce((sum, n) => sum + n.amount, 0);
    const wonCount = negotiations.filter(n => n.status === NegotiationStatus.CLOSED_WON).length;
    const activeCount = negotiations.filter(n => 
      [NegotiationStatus.NEGOTIATION, NegotiationStatus.PROPOSAL].includes(n.status)
    ).length;
    const totalCount = negotiations.length;

    return { totalAmount, wonCount, activeCount, totalCount };
  }, [negotiations]);

  // Chart Data Preparation
  const statusData = useMemo(() => {
    const counts = negotiations.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(NegotiationStatus).map((key) => {
      const statusLabel = NegotiationStatus[key as keyof typeof NegotiationStatus];
      return {
        name: statusLabel,
        value: counts[statusLabel] || 0,
      };
    }).filter(d => d.value > 0);
  }, [negotiations]);

  const amountByMonth = useMemo(() => {
    const months: Record<string, number> = {};
    negotiations.forEach(n => {
      const month = n.date.substring(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + n.amount;
    });
    
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [negotiations]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">ダッシュボード</h2>
        <p className="text-gray-500">現在の営業状況のサマリー</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="総商談数" 
          value={`${stats.totalCount}件`} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="今月の予想売上" 
          value={`¥${stats.totalAmount.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="進行中案件" 
          value={`${stats.activeCount}件`} 
          icon={Users} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="今月の受注数" 
          value={`${stats.wonCount}件`} 
          icon={CheckCircle} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月別売上予測推移</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(value) => `¥${value/10000}万`} />
                <Tooltip 
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '金額']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ステータス別内訳</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};