/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ReactNode, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  FileText, 
  BarChart3, 
  Layers, 
  Download, 
  HelpCircle, 
  Info, 
  X, 
  ChevronRight, 
  Lock, 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Hash,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  LogOut,
  History,
  Calendar,
  ArrowRight
} from 'lucide-react';

// --- Types ---
type Page = 'home' | 'login' | 'signup' | 'dashboard';
type ModalType = 'features' | 'help' | 'about' | 'forgot-password' | null;

interface Transaction {
  date: string;
  description: string;
  coaCategory: string;
  debit: number;
  credit: number;
  balance: number;
}

interface UserData {
  firstName: string;
  lastName: string;
  employeeId: string;
  bankName: string;
  bankCode: string;
  phone: string;
  address: string;
}

interface Statement {
  id: string;
  fileName: string;
  uploadDate: string;
  bankName: string | null;
  userName: string | null;
  currentBalance: number | null;
  userId: string;
}

// --- Components ---

const Navbar = ({ onNavigate, activePage, openModal, user, onLogout }: { 
  onNavigate: (p: Page) => void, 
  activePage: Page,
  openModal: (m: ModalType) => void,
  user: UserData | null,
  onLogout: () => void
}) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between border-b border-secondary-light-gray/30">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onNavigate(user ? 'dashboard' : 'home')}
      >
        <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white">
          <FileText size={24} />
        </div>
        <span className="text-2xl font-display text-primary-purple">FinExtract</span>
      </div>

      {!user ? (
        <>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-dark-gray">
            <button onClick={() => openModal('features')} className="hover:text-primary-purple transition-colors">Features</button>
            <button onClick={() => openModal('help')} className="hover:text-primary-purple transition-colors">Help & Learning</button>
            <button onClick={() => openModal('about')} className="hover:text-primary-purple transition-colors">About Us</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm font-semibold text-primary-purple hover:opacity-80 transition-opacity"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-2 gradient-bg text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary-purple/20 transition-all"
            >
              Sign Up
            </button>
          </div>
        </>
      ) : (
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-secondary-pale-purple/30 flex items-center justify-center text-primary-purple hover:bg-secondary-pale-purple/50 transition-all border border-primary-purple/20"
          >
            <User size={24} />
          </button>

          {showProfile && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfile(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-secondary-light-gray/20 z-50 overflow-hidden"
              >
                <div className="p-6 bg-secondary-pale-purple/10 border-b border-secondary-light-gray/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-black leading-tight">{user.firstName} {user.lastName}</h3>
                      <p className="text-xs text-secondary-dark-gray">Employee ID: {user.employeeId}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-secondary-dark-gray">
                    <Building2 size={16} className="text-primary-purple shrink-0" />
                    <span className="truncate">{user.bankName} ({user.bankCode})</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary-dark-gray">
                    <Phone size={16} className="text-primary-purple shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary-dark-gray">
                    <MapPin size={16} className="text-primary-purple shrink-0" />
                    <span className="truncate">{user.address}</span>
                  </div>
                </div>

                <div className="p-2 bg-gray-50 border-t border-secondary-light-gray/20">
                  <button 
                    onClick={() => {
                      setShowProfile(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: ReactNode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-secondary-light-gray flex items-center justify-between bg-secondary-pale-purple/30">
          <h2 className="text-2xl font-display text-primary-purple">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-secondary-dark-gray" />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Page Content ---

const Hero = ({ onSignUp }: { onSignUp: () => void }) => (
  <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-6xl md:text-7xl mb-6 leading-tight">
        Smart Financial Data <br />
        <span className="text-gradient">Extraction</span> Made Effortless
      </h1>
      <p className="text-xl text-secondary-dark-gray mb-10 max-w-lg leading-relaxed">
        Upload bank statements and instantly convert them into structured, categorized spreadsheets.
      </p>
      <button 
        onClick={onSignUp}
        className="px-10 py-4 gradient-bg text-white rounded-full text-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary-purple/20"
      >
        Get Started Now <ChevronRight size={20} />
      </button>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <div className="absolute -inset-4 gradient-bg opacity-10 blur-3xl rounded-full" />
      <img 
        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop" 
        alt="Banking Sector" 
        className="relative rounded-3xl shadow-2xl border border-white/20 object-cover aspect-video"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  </section>
);

const AboutSection = () => (
  <section className="py-20 px-6 bg-secondary-pale-purple/20">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div className="order-2 md:order-1">
        <img 
          src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=1000&auto=format&fit=crop" 
          alt="Banking Professional" 
          className="rounded-3xl shadow-xl aspect-video object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="order-1 md:order-2">
        <h2 className="text-4xl mb-6 text-primary-purple">About FinExtract</h2>
        <p className="text-lg text-secondary-dark-gray leading-relaxed mb-6">
          FinExtract is designed to simplify financial data handling by automating the extraction and organization of bank transactions. Our goal is to reduce manual effort, improve accuracy, and help professionals focus on insights rather than data entry.
        </p>
        <div className="flex gap-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light-gray">
            <h4 className="font-bold text-primary-purple mb-1">99% Accuracy</h4>
            <p className="text-sm text-secondary-dark-gray">High precision OCR technology</p>
          </div>
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-secondary-light-gray">
            <h4 className="font-bold text-primary-purple mb-1">Fast Processing</h4>
            <p className="text-sm text-secondary-dark-gray">Results in seconds</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <div className="grid md:grid-cols-2 gap-6">
    {[
      {
        icon: <FileText className="text-primary-purple" />,
        title: "Automated Transaction Extraction",
        desc: "Extract transaction data instantly from bank statements, PDFs, or images with high accuracy."
      },
      {
        icon: <BarChart3 className="text-secondary-sky-blue" />,
        title: "Structured Spreadsheet Output",
        desc: "Convert raw financial data into clean, well-organized spreadsheets ready for analysis."
      },
      {
        icon: <Layers className="text-secondary-lavender" />,
        title: "Smart Categorization",
        desc: "Automatically classify transactions into meaningful categories like expenses, income, utilities, etc."
      },
      {
        icon: <Download className="text-primary-black" />,
        title: "Easy Export & Download",
        desc: "Download processed data in spreadsheet format for reporting, auditing, or personal tracking."
      }
    ].map((f, i) => (
      <div key={i} className="p-6 rounded-2xl bg-secondary-pale-purple/30 border border-secondary-light-gray hover:border-primary-purple transition-colors">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
          {f.icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{f.title}</h3>
        <p className="text-secondary-dark-gray text-sm leading-relaxed">{f.desc}</p>
      </div>
    ))}
  </div>
);

const SignUpPage = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    bankName: '',
    bankCode: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        onNavigate('login');
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-secondary-pale-purple/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="w-full md:w-1/3 gradient-bg p-12 text-white flex flex-col justify-center">
          <h2 className="text-4xl mb-6">Join FinExtract</h2>
          <p className="opacity-90 mb-8">Start automating your financial workflows today with our banking-grade extraction tool.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Lock size={16} /></div>
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><BarChart3 size={16} /></div>
              <span className="text-sm">Real-time Analysis</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 p-10">
          <h2 className="text-3xl font-display text-primary-purple mb-8">Create Account</h2>
          {error && <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-2 text-sm"><AlertCircle size={16} /> {error}</div>}
          <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" placeholder="John" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" placeholder="Doe" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Employee ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} type="text" placeholder="EMP-001" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Bank Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} type="text" placeholder="Global Bank" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Bank/Agency Code</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.bankCode} onChange={e => setFormData({...formData, bankCode: e.target.value})} type="text" placeholder="BK-452" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="+1 234 567 890" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Bank Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-secondary-light-gray" size={18} />
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Finance St, Banking District" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all h-24 resize-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
                <input required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div className="md:col-span-2 pt-4">
              <button disabled={loading} className="w-full py-4 gradient-bg text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary-purple/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="animate-spin" size={20} />}
                Create Account
              </button>
              <p className="text-center mt-6 text-sm text-secondary-dark-gray">
                Already have an account? <button onClick={() => onNavigate('login')} className="text-primary-purple font-bold hover:underline">Login</button>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = ({ onNavigate, onForgotPassword, onLoginSuccess }: { 
  onNavigate: (p: Page) => void, 
  onForgotPassword: () => void,
  onLoginSuccess: (user: UserData) => void
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', bankCode: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-secondary-pale-purple/10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-secondary-light-gray/20"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <FileText size={32} />
          </div>
          <h2 className="text-4xl font-display text-primary-purple">FinExtract</h2>
          <p className="text-secondary-dark-gray mt-2">Welcome back to professional extraction</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-2 text-sm"><AlertCircle size={16} /> {error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Employee ID</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
              <input required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} type="text" placeholder="EMP-001" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Bank/Agency Code</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
              <input required value={formData.bankCode} onChange={e => setFormData({...formData, bankCode: e.target.value})} type="text" placeholder="BK-452" className="w-full pl-10 pr-4 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-dark-gray">Password</label>
              <button type="button" onClick={onForgotPassword} className="text-xs font-bold text-primary-purple hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light-gray" size={18} />
              <input 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full pl-10 pr-12 py-3 bg-secondary-pale-purple/20 border border-transparent rounded-xl focus:border-primary-purple focus:bg-white outline-none transition-all" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light-gray hover:text-primary-purple"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button disabled={loading} className="w-full py-4 gradient-bg text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary-purple/20 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="animate-spin" size={20} />}
            Login
          </button>

          <p className="text-center mt-8 text-sm text-secondary-dark-gray">
            Don't have an account? <button onClick={() => onNavigate('signup')} className="text-primary-purple font-bold hover:underline">Sign Up</button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: UserData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankName, setBankName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [history, setHistory] = useState<Statement[]>([]);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/statements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setHistory(data.statements);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedStatementId]); // Refresh when a new statement is added

  const loadStatement = async (statement: Statement) => {
    setSelectedStatementId(statement.id);
    setBankName(statement.bankName);
    setUserName(statement.userName);
    setCurrentBalance(statement.currentBalance);
    setLoading(true);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/statements/${statement.id}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const extractedTxs = data.transactions.map((tx: any) => ({
        ...tx,
        coaCategory: tx.coaCategory === 'Others' ? categorizeDescription(tx.description) : tx.coaCategory
      }));

      setTransactions(extractedTxs);
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions for this statement.");
    } finally {
      setLoading(false);
    }
  };

  const deleteStatement = async (e: any, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this statement?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/statements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(s => s.id !== id));
        if (selectedStatementId === id) {
          setSelectedStatementId(null);
          setTransactions([]);
          setBankName(null);
          setUserName(null);
          setCurrentBalance(null);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm("Are you sure you want to clear all statement history?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/statements', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory([]);
        setSelectedStatementId(null);
        setTransactions([]);
        setBankName(null);
        setUserName(null);
        setCurrentBalance(null);
      }
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  const totals = transactions.reduce((acc, t) => ({
    debit: acc.debit + t.debit,
    credit: acc.credit + t.credit
  }), { debit: 0, credit: 0 });

  const netBalance = (currentBalance || 0) + totals.credit - totals.debit;

  // Aggregate transactions by date for the graph
  const chartData = transactions.reduce((acc: any[], t) => {
    const existingDate = acc.find(item => item.date === t.date);
    if (existingDate) {
      existingDate.debit += t.debit;
      existingDate.credit += t.credit;
    } else {
      acc.push({ date: t.date, debit: t.debit, credit: t.credit });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSelectedStatementId(null);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const categorizeDescription = (description: string): string => {
    const desc = description.toLowerCase();
    
    const mappings = [
      { category: 'Office Expenses', keywords: ['supplies', 'stationery', 'paper', 'ink', 'adobe', 'microsoft', 'saas', 'software', 'rent', 'furniture', 'repairs', 'cleaning', 'courier', 'postage'] },
      { category: 'Revenue', keywords: ['client', 'payment', 'sales', 'service fee', 'interest', 'dividend', 'refund', 'transfer in'] },
      { category: 'Utilities', keywords: ['electricity', 'water', 'gas', 'internet', 'isp', 'phone', 'mobile', 'recharge', 'cable tv', 'bill'] },
      { category: 'Food & Dining', keywords: ['restaurant', 'cafe', 'bar', 'grocery', 'supermarket', 'uber eats', 'doordash', 'zomato', 'catering', 'coffee', 'starbucks', 'mcdonalds'] },
      { category: 'Transport', keywords: ['fuel', 'petrol', 'diesel', 'taxi', 'uber', 'lyft', 'metro', 'bus', 'train', 'parking', 'toll', 'maintenance', 'airfare', 'flight'] },
      { category: 'Shopping', keywords: ['amazon', 'walmart', 'target', 'retail', 'clothing', 'electronics', 'personal', 'home decor', 'mall'] }
    ];

    for (const mapping of mappings) {
      if (mapping.keywords.some(keyword => desc.includes(keyword))) {
        return mapping.category;
      }
    }

    return 'Others';
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setBankName(null);
    setUserName(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract transaction data from this bank statement. Also identify the Bank Name, the User Name (Account Holder), and the Current Balance if visible. IMPORTANT: The Current Balance should be the overall account balance mentioned in the header or summary (e.g., 'Balance as on', 'Opening Balance', 'Available Balance'). DO NOT use the credit or debit amount from the first transaction as the Current Balance. Return a JSON object with keys: bankName, userName, currentBalance (number or null if not found), transactions (array of objects with keys: date, description, coaCategory, debit, credit, balance). \n\nFor 'coaCategory', you MUST intelligently assign one of the following categories based on the transaction description. Do not default to 'Others' if a reasonable match can be found:\n\n- Office Expenses: Stationery, paper, ink, software subscriptions (SaaS, Adobe, Microsoft), office rent, furniture, repairs, cleaning services, courier, postage.\n- Revenue: Client payments, sales, service fees, interest income, dividends, refunds received, transfers in from other accounts.\n- Utilities: Electricity, water, gas, internet (ISP), phone bills, mobile recharge, cable TV.\n- Food & Dining: Restaurants, cafes, bars, groceries (supermarkets), food delivery (UberEats, DoorDash, Zomato), catering, coffee shops.\n- Transport: Fuel (petrol, diesel), taxi (Uber, Lyft), public transport (metro, bus, train), parking fees, tolls, vehicle maintenance, airfare.\n- Shopping: Retail stores (Amazon, Walmart, Target), clothing, electronics, personal items, home decor.\n- Others: Only use this if the description is completely vague or doesn't fit any above (e.g., 'Cash Withdrawal', 'ATM', 'Miscellaneous').\n\nEnsure debit and credit are numbers. If a value is missing, use 0." },
              { inlineData: { data: await fileToBase64(file), mimeType: file.type } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bankName: { type: Type.STRING },
              userName: { type: Type.STRING },
              currentBalance: { type: Type.NUMBER, nullable: true },
              transactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    description: { type: Type.STRING },
                    coaCategory: { type: Type.STRING },
                    debit: { type: Type.NUMBER },
                    credit: { type: Type.NUMBER },
                    balance: { type: Type.NUMBER }
                  },
                  required: ["date", "description", "coaCategory", "debit", "credit", "balance"]
                }
              }
            },
            required: ["transactions"]
          }
        }
      });

      const response = await model;
      const data = JSON.parse(response.text);
      const rawTxs = data.transactions || [];
      const extractedTxs = rawTxs.map((tx: any) => ({
        ...tx,
        coaCategory: tx.coaCategory === 'Others' ? categorizeDescription(tx.description) : tx.coaCategory
      }));
      
      const extractedBankName = data.bankName || null;
      const extractedUserName = data.userName || null;
      const extractedBalance = data.currentBalance !== undefined ? data.currentBalance : null;

      setTransactions(extractedTxs);
      setBankName(extractedBankName);
      setUserName(extractedUserName);
      setCurrentBalance(extractedBalance);

      // Save to MySQL via Backend
      const token = localStorage.getItem('token');
      const res = await fetch('/api/statements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          bankName: extractedBankName,
          userName: extractedUserName,
          currentBalance: extractedBalance,
          transactions: extractedTxs
        })
      });

      const result = await res.json();
      if (res.ok) {
        setSelectedStatementId(result.statementId);
      } else {
        console.error("Failed to save statement:", result.message);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to extract data. Please ensure the file is a valid bank statement.");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleExport = (format: 'xlsx' | 'csv') => {
    const metadata = [
      ["FinExtract - Financial Statement Report"],
      ["Bank Name:", bankName || "Not Identified"],
      ["User Name:", userName || "Not Identified"],
      ["Total Debited:", totals.debit.toFixed(2)],
      ["Total Credited:", totals.credit.toFixed(2)],
      ["Net Balance:", netBalance.toFixed(2)],
      [],
      ["Date", "Description", "CoA Category", "Debit", "Credit", "Balance"]
    ];

    const dataRows = transactions.map(t => [t.date, t.description, t.coaCategory, t.debit, t.credit, t.balance]);
    const ws = XLSX.utils.aoa_to_sheet([...metadata, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    if (format === 'xlsx') {
      XLSX.writeFile(wb, "FinExtract_Report.xlsx");
    } else {
      XLSX.writeFile(wb, "FinExtract_Report.csv", { bookType: 'csv' });
    }
  };

  const updateTransaction = (index: number, field: keyof Transaction, value: any) => {
    const updated = [...transactions];
    let newValue = value;
    
    // Auto-categorize if description changes and category is 'Others'
    if (field === 'description' && updated[index].coaCategory === 'Others') {
      const newCat = categorizeDescription(value);
      if (newCat !== 'Others') {
        updated[index].coaCategory = newCat;
      }
    }

    updated[index] = { ...updated[index], [field]: newValue };
    setTransactions(updated);
  };

  const deleteTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar / History Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-secondary-light-gray/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary-purple">
                <History size={20} />
                <h2 className="text-xl font-display">Statement History</h2>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearAllHistory}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingHistory ? (
                <div className="flex flex-col items-center py-10 text-secondary-dark-gray">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-xs">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-secondary-dark-gray">
                  <p className="text-sm italic">No past statements</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => loadStatement(item)}
                    className={`group relative p-4 rounded-2xl cursor-pointer border transition-all ${
                      selectedStatementId === item.id 
                        ? 'bg-primary-purple text-white border-primary-purple shadow-lg shadow-primary-purple/20' 
                        : 'bg-secondary-pale-purple/10 border-transparent hover:border-primary-purple/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className={selectedStatementId === item.id ? 'text-white' : 'text-primary-purple'} />
                        <div className="flex flex-col">
                          <p className="text-sm font-bold truncate max-w-[120px]">{item.fileName}</p>
                          <div className="flex items-center gap-1 opacity-70">
                            <Building2 size={12} />
                            <span className="text-xs truncate">{item.bankName || 'Unknown Bank'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedStatementId === item.id ? 'text-white/70' : 'text-secondary-dark-gray'}`}>
                          {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                        <p className={`text-[10px] ${selectedStatementId === item.id ? 'text-white/50' : 'text-secondary-dark-gray/50'}`}>
                          {new Date(item.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => deleteStatement(e, item.id)}
                      className={`absolute bottom-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                        selectedStatementId === item.id
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-secondary-light-gray/20">
            <h2 className="text-2xl font-display text-primary-purple mb-6">Upload New</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-secondary-light-gray rounded-2xl p-8 text-center cursor-pointer hover:border-primary-purple hover:bg-secondary-pale-purple/10 transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png,.docx"
              />
              <div className="w-16 h-16 bg-secondary-pale-purple/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-primary-purple" size={32} />
              </div>
              <p className="text-sm font-bold text-primary-black mb-1">Click to upload</p>
              <p className="text-xs text-secondary-dark-gray">PDF, JPG, PNG, DOCX</p>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-secondary-pale-purple/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="text-primary-purple shrink-0" size={20} />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <button onClick={() => {setFile(null); setPreview(null);}} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            )}

            {preview && (
              <div className="mt-6 rounded-xl overflow-hidden border border-secondary-light-gray">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}

            <button 
              disabled={!file || loading}
              onClick={handleExtract}
              className="w-full mt-8 py-4 gradient-bg text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Layers size={20} />}
              {loading ? "Extracting Data..." : "Extract Transactions"}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-xl flex items-start gap-2 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3 space-y-6">
          {(bankName || userName) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-purple text-white rounded-3xl p-6 shadow-xl flex flex-wrap gap-8"
            >
              {bankName && (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Bank Name</p>
                  <p className="text-xl font-bold">{bankName}</p>
                </div>
              )}
              {userName && (
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Account Holder</p>
                  <p className="text-xl font-bold">{userName}</p>
                </div>
              )}
            </motion.div>
          )}

          {transactions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-secondary-light-gray/20">
                <p className="text-xs font-bold text-secondary-dark-gray uppercase mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-primary-black">
                  {currentBalance !== null ? `₹${currentBalance.toLocaleString()}` : "Current Balance Not Available"}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-secondary-light-gray/20">
                <p className="text-xs font-bold text-secondary-dark-gray uppercase mb-1">Total Debit</p>
                <p className="text-2xl font-bold text-red-500">₹{totals.debit.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-secondary-light-gray/20">
                <p className="text-xs font-bold text-secondary-dark-gray uppercase mb-1">Total Credit</p>
                <p className="text-2xl font-bold text-green-500">₹{totals.credit.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-secondary-light-gray/20">
                <p className="text-xs font-bold text-secondary-dark-gray uppercase mb-1">Net Balance</p>
                <p className="text-2xl font-bold text-primary-purple">₹{netBalance.toLocaleString()}</p>
              </div>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-secondary-light-gray/20">
              <h3 className="text-xl font-display text-primary-purple mb-6">Transaction Analysis (Debit vs Credit)</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#9CA3AF'}}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#9CA3AF'}}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area 
                      name="Debit"
                      type="monotone" 
                      dataKey="debit" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorDebit)" 
                    />
                    <Area 
                      name="Credit"
                      type="monotone" 
                      dataKey="credit" 
                      stroke="#22C55E" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCredit)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-secondary-light-gray/20 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display text-primary-purple">Extraction Results</h2>
              {transactions.length > 0 && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleExport('csv')}
                    className="px-4 py-2 border border-secondary-light-gray rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-secondary-pale-purple/10 transition-all"
                  >
                    <Download size={16} /> CSV
                  </button>
                  <button 
                    onClick={() => handleExport('xlsx')}
                    className="px-4 py-2 gradient-bg text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <Download size={16} /> Excel
                  </button>
                </div>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-secondary-dark-gray">
                <div className="w-20 h-20 bg-secondary-pale-purple/20 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 size={40} className="opacity-20" />
                </div>
                <p className="text-lg font-medium">No data extracted yet</p>
                <p className="text-sm">Upload a statement to see results here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary-pale-purple/30 text-secondary-dark-gray text-xs uppercase tracking-wider">
                      <th className="p-4 rounded-l-xl">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">CoA Category</th>
                      <th className="p-4">Debit</th>
                      <th className="p-4">Credit</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.map((t, i) => (
                      <tr key={i} className="border-b border-secondary-light-gray/30 hover:bg-secondary-pale-purple/5 transition-colors">
                        <td className="p-4">
                          {editingId === i ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              value={t.date} 
                              onChange={e => updateTransaction(i, 'date', e.target.value)} 
                            />
                          ) : t.date}
                        </td>
                        <td className="p-4">
                          {editingId === i ? (
                            <input 
                              className="w-full p-1 border rounded" 
                              value={t.description} 
                              onChange={e => updateTransaction(i, 'description', e.target.value)} 
                            />
                          ) : t.description}
                        </td>
                        <td className="p-4">
                          {editingId === i ? (
                            <select 
                              className="w-full p-1 border rounded" 
                              value={t.coaCategory} 
                              onChange={e => updateTransaction(i, 'coaCategory', e.target.value)}
                            >
                              <option value="Office Expenses">Office Expenses</option>
                              <option value="Revenue">Revenue</option>
                              <option value="Utilities">Utilities</option>
                              <option value="Food & Dining">Food & Dining</option>
                              <option value="Transport">Transport</option>
                              <option value="Shopping">Shopping</option>
                              <option value="Others">Others</option>
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-secondary-pale-purple/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-purple">
                              {t.coaCategory}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-red-500 font-medium">
                          {editingId === i ? (
                            <input 
                              type="number"
                              className="w-full p-1 border rounded" 
                              value={t.debit} 
                              onChange={e => updateTransaction(i, 'debit', parseFloat(e.target.value))} 
                            />
                          ) : t.debit.toFixed(2)}
                        </td>
                        <td className="p-4 text-green-500 font-medium">
                          {editingId === i ? (
                            <input 
                              type="number"
                              className="w-full p-1 border rounded" 
                              value={t.credit} 
                              onChange={e => updateTransaction(i, 'credit', parseFloat(e.target.value))} 
                            />
                          ) : t.credit.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold">
                          {editingId === i ? (
                            <input 
                              type="number"
                              className="w-full p-1 border rounded" 
                              value={t.balance} 
                              onChange={e => updateTransaction(i, 'balance', parseFloat(e.target.value))} 
                            />
                          ) : t.balance.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingId(editingId === i ? null : i)}
                              className="p-2 hover:bg-secondary-pale-purple/30 rounded-lg transition-colors text-primary-purple"
                            >
                              {editingId === i ? <Check size={18} /> : <Edit2 size={18} />}
                            </button>
                            <button 
                              onClick={() => deleteTransaction(i)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [user, setUser] = useState<UserData | null>(null);

  const closeModal = () => setActiveModal(null);

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('home');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (currentPage === 'dashboard') setCurrentPage('home');
        return;
      }

      try {
        const res = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setCurrentPage('dashboard');
        } else {
          localStorage.removeItem('token');
          setCurrentPage('home');
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-primary-purple selection:text-white">
      <Navbar 
        onNavigate={setCurrentPage} 
        activePage={currentPage} 
        openModal={setActiveModal} 
        user={user}
        onLogout={handleLogout}
      />

      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onSignUp={() => setCurrentPage('signup')} />
              <AboutSection />
              <footer className="py-10 text-center text-secondary-dark-gray border-t border-secondary-light-gray/30">
                <p>&copy; 2026 FinExtract. All rights reserved.</p>
              </footer>
            </motion.div>
          )}

          {currentPage === 'login' && (
            <motion.div 
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginPage 
                onNavigate={setCurrentPage} 
                onForgotPassword={() => setActiveModal('forgot-password')} 
                onLoginSuccess={handleLoginSuccess}
              />
            </motion.div>
          )}

          {currentPage === 'signup' && (
            <motion.div 
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SignUpPage onNavigate={setCurrentPage} />
            </motion.div>
          )}

          {currentPage === 'dashboard' && user && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'features' && (
          <Modal isOpen={true} onClose={closeModal} title="Our Features">
            <FeaturesGrid />
          </Modal>
        )}
        {activeModal === 'help' && (
          <Modal isOpen={true} onClose={closeModal} title="Help & Learning">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-secondary-pale-purple/30 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-purple shrink-0 shadow-sm">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">How to use FinExtract</h3>
                  <p className="text-secondary-dark-gray leading-relaxed">
                    After logging in, you will find an option called <span className="font-bold text-primary-purple">‘Upload Bank Statements’</span>.
                  </p>
                  <p className="text-secondary-dark-gray leading-relaxed mt-2">
                    Simply upload your document (PDF, image, or file), and FinExtract will automatically process it and generate a structured spreadsheet.
                  </p>
                  <p className="text-secondary-dark-gray leading-relaxed mt-2">
                    You can review, manage, and download the extracted data <span className="font-bold text-primary-purple">بسهولة</span>.
                  </p>
                </div>
              </div>
              <div className="p-6 border border-secondary-light-gray rounded-2xl">
                <h4 className="font-bold mb-2">Supported Formats</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm text-secondary-dark-gray">
                  <li className="flex items-center gap-2">• PDF Documents</li>
                  <li className="flex items-center gap-2">• Scanned Images</li>
                  <li className="flex items-center gap-2">• PNG / JPEG</li>
                  <li className="flex items-center gap-2">• Bank CSVs</li>
                </ul>
              </div>
            </div>
          </Modal>
        )}
        {activeModal === 'about' && (
          <Modal isOpen={true} onClose={closeModal} title="About Us">
            <div className="space-y-6">
              <img 
                src="https://picsum.photos/seed/office/800/400" 
                alt="Our Office" 
                className="w-full h-48 object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary-purple">Simplifying Financial Data</h3>
                <p className="text-secondary-dark-gray leading-relaxed">
                  FinExtract is designed to simplify financial data handling by automating the extraction and organization of bank transactions. Our goal is to reduce manual effort, improve accuracy, and help professionals focus on insights rather than data entry.
                </p>
                <div className="p-4 bg-secondary-pale-purple/20 rounded-xl border-l-4 border-primary-purple">
                  <p className="italic text-secondary-dark-gray">
                    "Empowering financial professionals with intelligent automation."
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
        {activeModal === 'forgot-password' && (
          <Modal isOpen={true} onClose={closeModal} title="Reset Password">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-secondary-pale-purple/50 rounded-full flex items-center justify-center text-primary-purple mx-auto mb-6">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Contact Manager</h3>
              <p className="text-secondary-dark-gray text-lg max-w-sm mx-auto">
                Reset your password by contacting your current bank manager.
              </p>
              <button 
                onClick={closeModal}
                className="mt-8 px-8 py-3 gradient-bg text-white rounded-xl font-bold"
              >
                Got it
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
