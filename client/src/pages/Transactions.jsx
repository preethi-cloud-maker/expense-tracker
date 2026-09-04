import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Receipt, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/format';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category_id: '',
    description: '',
    payment_method: 'Cash',
    transaction_date: new Date().toISOString().split('T')[0]
  });
//READ OPERATION
  const fetchData = async () => {
    try {
      const res = await api.get('/transactions', {
        params: { type, category_id: categoryId, search, sort }
      });
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [type, categoryId, search, sort]);

  // Set default category when type changes if no category is selected
  useEffect(() => {
    const filteredCats = categories.filter(c => c.type === formData.type);
    if (filteredCats.length > 0 && (!formData.category_id || !filteredCats.find(c => c.id === parseInt(formData.category_id)))) {
      setFormData(prev => ({ ...prev, category_id: filteredCats[0].id }));
    }
  }, [formData.type, categories, formData.category_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? 'Updating...' : 'Saving...');
    try {
      if (editingId) {
        //UPDATE
        await api.put(`/transactions/${editingId}`, formData);
        toast.success('Transaction updated', { id: loadingToast });
      } else {
        //CREATE
        await api.post('/transactions', formData);
        toast.success('Transaction added', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Error saving transaction', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    //DELETE
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const loadingToast = toast.loading('Deleting...');
      try {
        await api.delete(`/transactions/${id}`);
        toast.success('Transaction deleted', { id: loadingToast });
        fetchData();
      } catch (err) {
        toast.error('Error deleting transaction', { id: loadingToast });
      }
    }
  };

  const openModal = (tx = null) => {
    if (tx) {
      setEditingId(tx.id);
      setFormData({
        type: tx.type,
        amount: tx.amount,
        category_id: tx.category_id,
        description: tx.description,
        payment_method: tx.payment_method,
        transaction_date: tx.transaction_date.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
        description: '',
        payment_method: 'Cash',
        transaction_date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-slate-500 mt-1">Track and manage your income and expenses.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center font-medium shadow-sm shadow-blue-200 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5 mr-1.5" /> Add Transaction
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:flex-1 relative group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3 flex-wrap sm:flex-nowrap">
          <select 
            className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer" 
            value={type} onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select 
            className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer" 
            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer min-w-[140px]" 
            value={sort} onChange={(e) => setSort(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(tx.transaction_date)}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{tx.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{tx.payment_method}</td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(tx)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Receipt className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No transactions found</h3>
                        <p className="text-slate-500 mb-4 text-sm max-w-sm">
                          {search || type || categoryId ? "Try adjusting your filters to find what you're looking for." : "Start tracking your finances by adding your first transaction."}
                        </p>
                        {!(search || type || categoryId) && (
                          <button onClick={() => openModal()} className="text-blue-600 font-medium text-sm hover:underline">
                            + Add Transaction
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Switch */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={(e) => setFormData({...formData, type: e.target.value, category_id: ''})} className="peer sr-only" />
                  <div className="text-center py-2 text-sm font-medium rounded-lg text-slate-500 peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm transition-all">Expense</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={(e) => setFormData({...formData, type: e.target.value, category_id: ''})} className="peer sr-only" />
                  <div className="text-center py-2 text-sm font-medium rounded-lg text-slate-500 peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm transition-all">Income</div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹)</label>
                <input 
                  type="number" step="0.01" required placeholder="0.00"
                  value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-lg" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <input 
                  type="text" required placeholder="What was this for?"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select 
                    required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Category</option>
                    {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
                  <select 
                    required value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input 
                  type="date" required 
                  value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
                  {editingId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
