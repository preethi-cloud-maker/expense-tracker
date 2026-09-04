import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, CreditCard, AlertCircle, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate, formatPercent } from '../utils/format';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [summaryRes, monthlyRes, categoryRes, budgetsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/monthly'),
        api.get('/dashboard/categories'),
        api.get(`/budgets?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
      ]);
      
      setSummary(summaryRes.data);
      setMonthlyData(monthlyRes.data);
      // BUG FIX: parse MySQL decimal strings to float for Recharts
      setCategoryData(categoryRes.data.map(d => ({ name: d.name, value: parseFloat(d.value) })));
      setBudgets(budgetsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
        <div className="h-80 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );

  if (!summary) return <div className="text-center text-slate-500 py-12">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Here's your financial overview for this month.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Balance</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(summary.totalBalance)}</p>
          <p className="text-xs text-slate-500">Available balance</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Income</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(summary.totalIncome)}</p>
          <p className="text-xs text-slate-500">All time income</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</h3>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-xs text-slate-500">All time expenses</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Month Expenses</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(summary.currentMonthExpenses)}</p>
          <p className="text-xs text-slate-500">This month's spending</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Income vs Expense</h3>
            <p className="text-sm text-slate-500">Last 6 months trend</p>
          </div>
          <div className="h-[300px] w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-slate-400">
                <BarChart className="w-16 h-16 mb-2 opacity-20" />
                <p>No monthly data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Expenses by Category</h3>
            <p className="text-sm text-slate-500">Where your money went this month</p>
          </div>
          <div className="h-[300px] w-full relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-slate-400">
                <PieChart className="w-16 h-16 mb-3 text-slate-200" />
                <p className="text-slate-600 font-medium">No expenses this month</p>
                <p className="text-sm">Add your first expense to see insights.</p>
              </div>
            )}
            
            {/* Center Text for Donut Chart */}
            {categoryData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-500 font-medium">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(summary.currentMonthExpenses)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-sm text-slate-500">Your latest financial activity</p>
            </div>
            <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center group">
              View all <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.payment_method}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(tx.transaction_date)}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
                {summary.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <p className="text-slate-600 font-medium">No recent transactions</p>
                      <Link to="/transactions" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Add your first transaction</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget Overview (Smart Alerts) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Budget Overview</h3>
            <p className="text-sm text-slate-500">Track your spending limits</p>
          </div>
          
          <div className="flex-1 space-y-5 overflow-y-auto pr-2">
            {budgets.length > 0 ? budgets.map(b => {
              const percent = Math.min((b.spent / b.amount) * 100, 100);
              const isExceeded = b.spent >= b.amount;
              const isWarning = percent >= 80 && !isExceeded;
              
              let statusColor = 'text-emerald-600';
              let barColor = 'bg-emerald-500';
              let bgColor = 'bg-emerald-50';
              let Icon = CheckCircle2;
              let msg = 'On track';

              if (isExceeded) {
                statusColor = 'text-rose-600';
                barColor = 'bg-rose-500';
                bgColor = 'bg-rose-50';
                Icon = AlertCircle;
                msg = 'Exceeded budget';
              } else if (isWarning) {
                statusColor = 'text-amber-600';
                barColor = 'bg-amber-500';
                bgColor = 'bg-amber-50';
                Icon = AlertCircle;
                msg = "You're close to limit";
              }

              return (
                <div key={b.id} className={`p-4 rounded-xl border ${isExceeded ? 'border-rose-100' : isWarning ? 'border-amber-100' : 'border-slate-100'} transition-colors`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-900">{b.category_name}</h4>
                    <span className="text-sm font-medium text-slate-500">
                      <span className="text-slate-900">{formatCurrency(b.spent)}</span> / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                  </div>
                  
                  <div className={`flex items-center text-xs font-medium ${statusColor} ${bgColor} w-fit px-2.5 py-1 rounded-lg`}>
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {msg} ({formatPercent(percent)})
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10">
                <PieChart className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-slate-600 font-medium">No budgets set</p>
                <Link to="/budgets" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Create a budget</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
