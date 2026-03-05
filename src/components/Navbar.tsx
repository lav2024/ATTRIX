import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Employee, Meeting } from '../types';
import { 
  LayoutDashboard, 
  Upload, 
  LogOut, 
  Fingerprint, 
  User as UserIcon, 
  ChevronDown, 
  Calendar, 
  AlertCircle, 
  Clock,
  History
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  employees: Employee[];
  meetings: Meeting[];
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, employees, meetings }) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lastSignOut, setLastSignOut] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const loadData = () => {
    if (!user) return;
    
    const savedLastSignOut = localStorage.getItem(`attrix_last_signout_${user.id}`);
    if (savedLastSignOut) {
      setLastSignOut(savedLastSignOut);
    } else {
      setLastSignOut(null);
    }
  };

  useEffect(() => {
    loadData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      loadData();
    }
  }, [isProfileOpen]);

  const highRiskCount = employees.filter(e => e.riskLevel === 'High').length;
  const mediumRiskCount = employees.filter(e => e.riskLevel === 'Medium').length;

  const handleLogoutClick = () => {
    if (user) {
      const now = new Date().toLocaleString();
      localStorage.setItem(`attrix_last_signout_${user.id}`, now);
    }
    onLogout();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ATTRIX</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link 
                  to="/upload" 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/upload') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Predict</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 hidden md:block">Profile</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[60]">
                      <div className="p-6 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Predicted Results Summary */}
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Current Predictions</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                              <div className="text-red-600 font-black text-xl">{highRiskCount}</div>
                              <div className="text-[10px] text-red-500 font-bold uppercase">High Risk</div>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                              <div className="text-amber-600 font-black text-xl">{mediumRiskCount}</div>
                              <div className="text-[10px] text-amber-500 font-bold uppercase">Medium Risk</div>
                            </div>
                          </div>
                        </div>

                        {/* Upcoming Meetings */}
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Upcoming Meetings</div>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {meetings.length > 0 ? (
                              meetings.slice(0, 3).map((meeting) => (
                                <div key={meeting.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-sm">
                                    <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs font-bold text-slate-900 truncate">{meeting.employeeName}</div>
                                      {employees.find(e => e.name === meeting.employeeName)?.riskLevel === 'High' && (
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" title="High Risk" />
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center mt-0.5">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(meeting.date).toLocaleDateString()} • {formatTime(meeting.time)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold">No meetings scheduled</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Last Sign Out */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between px-2 py-1">
                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <History className="h-3 w-3 mr-1.5" />
                              Last Sign Out
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {lastSignOut || 'First session'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button 
                          onClick={handleLogoutClick}
                          className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Log in</Link>
                <Link to="/register" className="ml-4 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
