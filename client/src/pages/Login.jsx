import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ShieldCheck, BarChart3, Target, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // rememberMe logic could be handled here in the future if implemented in AuthContext,
      // but for now we preserve the existing login signature and behavior.
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* LEFT SIDE - Branding & Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden border-r border-slate-100 flex-col">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl"></div>
          <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-200/30 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/20">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SpendWise</h1>
            </div>
          </div>

          {/* Main Marketing Copy */}
          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Track Your Expenses,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Build Your Future</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              SpendWise helps you manage your money, track expenses, set budgets, and achieve your financial goals with premium precision.
            </p>
          </div>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center -mx-4 mb-8">
            <img 
              src="/login_illustration.png" 
              alt="SpendWise Finance Dashboard Illustration" 
              className="max-w-full h-auto object-contain max-h-[340px] drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500"
            />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-auto">
            <div className="flex flex-col gap-2">
              <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Secure & Private</h4>
                <p className="text-xs text-slate-500 mt-0.5">Your financial data stays protected.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Smart Insights</h4>
                <p className="text-xs text-slate-500 mt-0.5">Understand where your money goes.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 shadow-sm border border-slate-100">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Easy Budgeting</h4>
                <p className="text-xs text-slate-500 mt-0.5">Set budgets and manage spending.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SpendWise</h1>
        </div>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10 text-center lg:text-left mt-10 lg:mt-0">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back! 👋</h2>
            <p className="text-slate-500">Login to continue to your SpendWise account</p>
          </div>

          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg mb-6 shadow-sm flex items-start gap-3">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white border border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                  <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors select-none">Remember me</span>
              </label>
              
              {/* Note: We omit "Forgot Password" link as requested unless a functional route exists. 
                  Since it doesn't exist in the MVP, we omit it. */}
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
