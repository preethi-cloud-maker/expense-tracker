import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, PieChart, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatPercent } from '../utils/format';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category_id: '', amount: '' });

  const fetchBudgets = async () => {
    try {
      const res = await api.get(`/budgets?month=${month}&year=${year}`);
      setBudgets(res.data);
    } catch (err) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.filter(c => c.type === 'expense'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? 'Updating...' : 'Saving...');
    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}`, { amount: formData.amount });
        toast.success('Budget updated', { id: loadingToast });
      } else {
        await api.post('/budgets', { ...formData, month, year });
        toast.success('Budget created', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      const loadingToast = toast.loading('Deleting...');
      try {
        await api.delete(`/budgets/${id}`);
        toast.success('Budget deleted', { id: loadingToast });
        fetchBudgets();
      } catch (err) {
        toast.error('Error deleting budget', { id: loadingToast });
      }
    }
  };

  const openModal = (b = null) => {
    if (b) {
      setEditingId(b.id);
      setFormData({ category_id: b.category_id, amount: b.amount });
    } else {
      setEditingId(null);
      setFormData({ category_id: categories.length > 0 ? categories[0].id : '', amount: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Budgets</h2>
          <p className="text-slate-500 mt-1">Set spending limits and stay on track.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center font-medium shadow-sm shadow-blue-200 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-1.5" /> Create Budget
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-fit">
        <select 
          className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium cursor-pointer" 
          value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <select 
          className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium cursor-pointer" 
          value={year} onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Budget Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(b => {
            const percent = Math.min((b.spent / b.amount) * 100, 100);
            const isExceeded = b.spent >= b.amount;
            const isWarning = percent >= 80 && !isExceeded;
            const remaining = Math.max(0, b.amount - b.spent);
            
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
              msg = 'Exceeded';
            } else if (isWarning) {
              statusColor = 'text-amber-600';
              barColor = 'bg-amber-500';
              bgColor = 'bg-amber-50';
              Icon = AlertCircle;
              msg = "Warning";
            }

            return (
              <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(b)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${bgColor} ${statusColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{b.category_name}</h3>
                    <p className={`text-xs font-semibold ${statusColor}`}>{msg}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-0.5">Spent</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(b.spent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 font-medium mb-0.5">Budget</p>
                    <p className="text-lg font-semibold text-slate-600">{formatCurrency(b.amount)}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{formatPercent(percent)} used</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(remaining)} left</span>
                </div>
              </div>
            );
          })}
          
          {budgets.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <PieChart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No budgets found</h3>
                <p className="text-slate-500 mb-4 text-sm max-w-sm">
                  You haven't set any budgets for {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}.
                </p>
                <button onClick={() => openModal()} className="text-blue-600 font-medium text-sm hover:underline">
                  + Create your first budget
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Budget' : 'Add Budget'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select 
                    required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Amount (₹)</label>
                <input 
                  type="number" step="0.01" required placeholder="0.00"
                  value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-lg" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
                  {editingId ? 'Save Changes' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
