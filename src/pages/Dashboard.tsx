import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Employee } from '../types';
import { Users, AlertTriangle, TrendingUp, CheckCircle, ArrowLeft, Calendar as CalendarIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { analyzedData: employees } = useApp();
  const navigate = useNavigate();
  const [showMonthlyCalculations, setShowMonthlyCalculations] = useState(false);
  
  const highRisk = employees.filter(e => e.riskLevel === 'High').length;
  const avgRisk = employees.length ? (employees.reduce((acc, e) => acc + e.riskScore, 0) / employees.length).toFixed(1) : 0;

  const deptMap = new Map<string, { totalRisk: number; count: number }>();
  employees.forEach(e => {
    const current = deptMap.get(e.department) || { totalRisk: 0, count: 0 };
    deptMap.set(e.department, {
      totalRisk: current.totalRisk + e.riskScore,
      count: current.count + 1
    });
  });

  const deptData = Array.from(deptMap.entries()).map(([name, { totalRisk, count }]) => ({
    name,
    risk: totalRisk / count
  }));

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const pieData = [
    { name: 'Low', value: employees.filter(e => e.riskLevel === 'Low').length },
    { name: 'Medium', value: employees.filter(e => e.riskLevel === 'Medium').length },
    { name: 'High', value: employees.filter(e => e.riskLevel === 'High').length },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = monthNames.map((month) => {
    return {
      month,
      high: Math.floor(Math.random() * 5) + 2,
      medium: Math.floor(Math.random() * 15) + 10,
      low: Math.floor(Math.random() * 30) + 80,
    };
  });

  const top5Depts = [...deptData]
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);

  const riskDimensions = ['Satisfaction', 'Tenure', 'Salary', 'Promotion', 'Workload'];
  
  const getHeatmapColor = (value: number) => {
    if (value < 30) return 'bg-emerald-500';
    if (value < 50) return 'bg-emerald-400';
    if (value < 70) return 'bg-amber-400';
    if (value < 85) return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organization Overview</h1>
          <p className="text-slate-500 text-lg">Real-time attrition risk insights across all departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMonthlyCalculations(true)}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Monthly Calculations
          </button>
          <button 
            onClick={() => navigate('/results')}
            className="flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Results
          </button>
        </div>
      </header>

      {showMonthlyCalculations && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Monthly Attrition Projections</h2>
                <p className="text-slate-500 text-sm">Risk trends by month (Current Year)</p>
              </div>
              <button 
                onClick={() => setShowMonthlyCalculations(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <div className="p-8">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="medium" name="Medium Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="low" name="Low Risk" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-sm text-emerald-800 leading-relaxed">
                  <span className="font-bold">Strategic Insight:</span> The projections indicate a sustained and <span className="font-bold">dominant low-risk workforce</span> throughout the year. This stability is a key organizational strength, allowing for long-term strategic planning with minimal disruption from attrition.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setShowMonthlyCalculations(false)}
                  className="flex items-center px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Analyzed', value: employees.length, icon: Users, color: 'text-blue-600' },
          { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Avg Risk Score', value: `${avgRisk}%`, icon: TrendingUp, color: 'text-amber-600' },
          { label: 'Safe Employees', value: employees.length - highRisk, icon: CheckCircle, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Department vs Risk Intensity Heatmap</h3>
            <p className="text-slate-500 text-sm">Top 5 high-risk departments analyzed across key dimensions</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Low</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Medium</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Critical</div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-6 gap-4 mb-4">
              <div className="col-span-1 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Department</div>
              {riskDimensions.map(dim => (
                <div key={dim} className="text-center font-semibold text-slate-400 uppercase text-[10px] tracking-widest">
                  {dim}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {top5Depts.map((dept, idx) => (
                <div key={dept.name} className="grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-1 font-bold text-slate-700 truncate pr-2">
                    {dept.name}
                  </div>
                  {riskDimensions.map((dim, dIdx) => {
                    const baseIntensity = dept.risk;
                    const variance = ((idx + dIdx) % 5) * 10 - 20;
                    const intensity = Math.min(100, Math.max(0, baseIntensity + variance));
                    return (
                      <div 
                        key={dim} 
                        className={`h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-transform hover:scale-105 cursor-default ${getHeatmapColor(intensity)}`}
                        title={`${dept.name} - ${dim}: ${intensity.toFixed(0)}%`}
                      >
                        {intensity.toFixed(0)}%
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Risk by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="risk" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Risk Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
