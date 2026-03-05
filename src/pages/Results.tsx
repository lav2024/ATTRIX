import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Employee, Meeting } from '../types';
import { AlertTriangle, TrendingUp, TrendingDown, Info, Lightbulb, ChevronRight, X, User, Briefcase, Calendar, DollarSign, Download, FileText, Clock, CheckCircle, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from '../context/AppContext';

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

const ClockPicker = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialTime 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (time: string) => void; 
  initialTime: string 
}) => {
  const [mode, setMode] = React.useState<'hours' | 'minutes'>('hours');
  const [hours, setHours] = React.useState(12);
  const [minutes, setMinutes] = React.useState(0);
  const [ampm, setAmpm] = React.useState<'AM' | 'PM'>('AM');
  const clockRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialTime && isOpen) {
      const [h, m] = initialTime.split(':').map(Number);
      setAmpm(h >= 12 ? 'PM' : 'AM');
      setHours(h % 12 || 12);
      setMinutes(m || 0);
      setMode('hours');
    }
  }, [initialTime, isOpen]);

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      if (h > 12) h -= 12;
      setHours(h);
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      setMinutes(m);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
    const moveHandler = (me: MouseEvent) => handleInteraction(me.clientX, me.clientY);
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
      if (mode === 'hours') setMode('minutes');
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    const moveHandler = (te: TouchEvent) => handleInteraction(te.touches[0].clientX, te.touches[0].clientY);
    const upHandler = () => {
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', upHandler);
      if (mode === 'hours') setMode('minutes');
    };
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('touchend', upHandler);
  };

  const handleConfirm = () => {
    let h = hours;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const timeStr = `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onSelect(timeStr);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="flex items-center justify-center gap-2 text-6xl font-black mb-6">
            <button 
              onClick={() => setMode('hours')}
              className={`transition-opacity ${mode === 'hours' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
            >
              {hours}
            </button>
            <span className="opacity-40">:</span>
            <button 
              onClick={() => setMode('minutes')}
              className={`transition-opacity ${mode === 'minutes' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
            >
              {minutes.toString().padStart(2, '0')}
            </button>
          </div>
          <div className="flex justify-center gap-6 font-bold text-lg">
            <button 
              onClick={() => setAmpm('AM')}
              className={`px-4 py-1 rounded-full transition-all ${ampm === 'AM' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-200 hover:text-white'}`}
            >
              AM
            </button>
            <button 
              onClick={() => setAmpm('PM')}
              className={`px-4 py-1 rounded-full transition-all ${ampm === 'PM' ? 'bg-white text-indigo-600 shadow-lg' : 'text-indigo-200 hover:text-white'}`}
            >
              PM
            </button>
          </div>
        </div>

        <div className="p-10 flex flex-col items-center">
          <div 
            ref={clockRef}
            className="relative w-56 h-56 bg-slate-50 rounded-full cursor-pointer shadow-inner border border-slate-100"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {[...Array(12)].map((_, i) => {
              const angle = (i + 1) * 30;
              const rad = (angle - 90) * (Math.PI / 180);
              const x = 50 + 38 * Math.cos(rad);
              const y = 50 + 38 * Math.sin(rad);
              const val = mode === 'hours' ? i + 1 : (i * 5);
              const isSelected = mode === 'hours' ? hours === (i + 1) : minutes === (i * 5);
              
              return (
                <div 
                  key={i}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 text-sm font-black transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {val === 0 && mode === 'minutes' ? '00' : val}
                </div>
              );
            })}

            <div 
              className="absolute top-1/2 left-1/2 w-1 bg-indigo-600 origin-bottom rounded-full transition-transform duration-300 ease-out"
              style={{ 
                height: '38%', 
                transform: `translate(-50%, -100%) rotate(${mode === 'hours' ? hours * 30 : minutes * 6}deg)` 
              }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full shadow-lg border-2 border-white" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
          </div>

          <div className="mt-10 flex gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Set Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Results() {
  const { user, analyzedData: employees, addMeeting: onAddMeeting } = useApp();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() => {
    if (!user) return null;
    const savedSelectedId = localStorage.getItem(`results_selected_id_${user.id}`);
    if (savedSelectedId && employees.length > 0) {
      return employees.find(e => e.id === savedSelectedId) || null;
    }
    return null;
  });
  const [planningEmployee, setPlanningEmployee] = useState<Employee | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({ date: '', time: '' });
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(280);
  const [searchQuery, setSearchQuery] = useState('');
  const isResizing = useRef(false);

  useEffect(() => {
    if (!user) return;
    const savedScroll = localStorage.getItem(`results_scroll_pos_${user.id}`);

    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll, 10),
          behavior: 'instant'
        });
      }, 100);
    }
  }, [user]);

  // Removed useEffect that called setSelectedEmployee() synchronously


  useEffect(() => {
    if (!user) return;
    const handleScroll = () => {
      localStorage.setItem(`results_scroll_pos_${user.id}`, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (selectedEmployee) {
      localStorage.setItem(`results_selected_id_${user.id}`, selectedEmployee.id);
    } else {
      localStorage.removeItem(`results_selected_id_${user.id}`);
    }
  }, [selectedEmployee, user]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const modalElement = document.getElementById('employee-detail-modal');
    if (!modalElement) return;
    const modalRect = modalElement.getBoundingClientRect();
    const newHeight = e.clientY - modalRect.top;
    if (newHeight >= 180 && newHeight <= 500) {
      setHeaderHeight(newHeight);
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', handleMouseMove);
    // We'll remove the listener in startResizing's cleanup or just use a named function
  }, [handleMouseMove]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    
    const onMouseUp = () => {
      stopResizing();
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [handleMouseMove, stopResizing]);

  if (!employees.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">No data analyzed yet.</h2>
        <p className="text-slate-500 mt-2">Please upload a file to see results.</p>
      </div>
    );
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => b.riskScore - a.riskScore);
  const top3 = sortedEmployees.slice(0, 3);

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('ATTRIX - Attrition Analysis Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Employees Analyzed: ${employees.length}`, 14, 35);

    const tableData = sortedEmployees.map(emp => [
      emp.name,
      emp.department,
      emp.role,
      `${emp.riskScore}%`,
      emp.riskLevel,
      `${emp.satisfactionScore}%`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Name', 'Department', 'Role', 'Risk Score', 'Risk Level', 'Satisfaction']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save('ATTRIX_Full_Workforce_Analysis.pdf');
  };

  const exportIndividualPDF = (emp: Employee) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text(`Employee Analysis: ${emp.name}`, 14, 25);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${emp.role} • ${emp.department}`, 14, 35);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 45, 182, 30, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('RISK SCORE', 20, 55);
    doc.text('TENURE', 80, 55);
    doc.text('SATISFACTION', 140, 55);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${emp.riskScore}%`, 20, 65);
    doc.text(`${emp.tenure} Years`, 80, 65);
    doc.text(`${emp.satisfactionScore}%`, 140, 65);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('AI Risk Explanation', 14, 90);
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    const splitExplanation = doc.splitTextToSize(emp.explanation, 180);
    doc.text(splitExplanation, 14, 100);
    let currentY = 100 + (splitExplanation.length * 7) + 10;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Key Risk Factors', 14, currentY);
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38);
    emp.riskFactors.forEach((factor, i) => {
      doc.text(`• ${factor}`, 14, currentY + 10 + (i * 7));
    });
    currentY = currentY + 10 + (emp.riskFactors.length * 7) + 10;
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Retention Recommendations', 14, currentY);
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    emp.recommendations.forEach((rec, i) => {
      const splitRec = doc.splitTextToSize(`${i + 1}. ${rec}`, 180);
      doc.text(splitRec, 14, currentY + 10 + (i * 15));
    });
    doc.save(`ATTRIX_Report_${emp.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {planningEmployee && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {!isFixed ? (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Schedule Meeting</h2>
                  <button onClick={() => setPlanningEmployee(null)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <div className="mb-6">
                  <div className="flex items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-4">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{planningEmployee.name}</div>
                      <div className="text-xs text-indigo-600 font-semibold">{planningEmployee.role}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                      <div className="relative group">
                        <input 
                          type="date" 
                          className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all group-hover:border-indigo-200"
                          value={meetingDetails.date}
                          onChange={(e) => setMeetingDetails({...meetingDetails, date: e.target.value})}
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Time</label>
                      <div 
                        onClick={() => setShowClockPicker(true)}
                        className="relative group cursor-pointer"
                      >
                        <div className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl group-hover:border-indigo-200 transition-all flex items-center">
                          <span className={`font-medium ${meetingDetails.time ? 'text-slate-900' : 'text-slate-400'}`}>
                            {meetingDetails.time ? formatTime(meetingDetails.time) : '--:--'}
                          </span>
                        </div>
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (planningEmployee) {
                      const newMeeting: Meeting = {
                        id: Math.random().toString(36).substr(2, 9),
                        employeeName: planningEmployee.name,
                        employeeRole: planningEmployee.role,
                        date: meetingDetails.date,
                        time: meetingDetails.time
                      };
                      onAddMeeting(newMeeting);
                      setIsFixed(true);
                    }
                  }}
                  disabled={!meetingDetails.date || !meetingDetails.time}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                >
                  Confirm Meeting
                </button>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Meeting Fixed!</h2>
                <p className="text-slate-500 mb-8">
                  Your conversation with <span className="font-bold text-slate-900">{planningEmployee.name}</span> is scheduled for {new Date(meetingDetails.date).toLocaleDateString()} at {formatTime(meetingDetails.time)}.
                </p>
                <button 
                  onClick={() => {
                    setPlanningEmployee(null);
                    setIsFixed(false);
                    setMeetingDetails({ date: '', time: '' });
                  }}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5 mr-2 rotate-180" />
                  Go Back to Results
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ClockPicker 
        isOpen={showClockPicker}
        onClose={() => setShowClockPicker(false)}
        initialTime={meetingDetails.time}
        onSelect={(time) => setMeetingDetails({ ...meetingDetails, time })}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Attrition Evaluation Results</h1>
          <p className="text-slate-500">Comprehensive analysis of employee turnover probability and retention strategies.</p>
        </div>
        <button 
          onClick={exportAllToPDF}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <Download className="h-5 w-5 mr-2" />
          Export All Reports
        </button>
      </div>

      <div className="mb-16">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-red-100 rounded-lg text-red-600 mr-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Critical: Top At-Risk Employees</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {top3.map((emp) => (
            <AtRiskCard 
              key={emp.id} 
              employee={emp} 
              onSelect={() => setSelectedEmployee(emp)} 
              onPlan={() => setPlanningEmployee(emp)}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-900">Full Analysis Table</h2>
            <div className="text-sm text-slate-500">{filteredEmployees.length} of {employees.length} Employees</div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search name, dept, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Dept / Role</th>
                <th className="px-6 py-4 text-center">Satisfaction</th>
                <th className="px-6 py-4 text-center">Risk Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-500">ID: {emp.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-slate-700">{emp.department}</div>
                    <div className="text-slate-400 text-xs">{emp.role}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden mr-2">
                        <div 
                          className={`h-full ${emp.satisfactionScore < 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                          style={{ width: `${emp.satisfactionScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{emp.satisfactionScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold
                      ${emp.riskScore > 70 ? 'bg-red-100 text-red-700' : 
                        emp.riskScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}
                    `}>
                      {emp.riskScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.riskScore > 70 ? (
                      <span className="flex items-center text-xs font-bold text-red-600 uppercase">
                        <TrendingUp className="h-3 w-3 mr-1" /> High Risk
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-green-600 uppercase">
                        <TrendingDown className="h-3 w-3 mr-1" /> Stable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedEmployee(emp)}
                      className="text-indigo-600 hover:text-indigo-800 p-2 transition-transform hover:translate-x-1"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div id="employee-detail-modal" className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div 
              style={{ height: `${headerHeight}px` }}
              className="relative p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shrink-0 transition-[height] duration-75 ease-out"
            >
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-6 mb-8">
                <div className="h-20 w-20 bg-indigo-500/30 rounded-3xl flex items-center justify-center border border-white/20">
                  <User className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedEmployee.name}</h2>
                  <p className="text-indigo-200 text-lg flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    {selectedEmployee.role} • {selectedEmployee.department}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                  <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Risk Score</div>
                  <div className="text-3xl font-bold">{selectedEmployee.riskScore}%</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                  <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Tenure</div>
                  <div className="text-3xl font-bold">{selectedEmployee.tenure}y</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                  <div className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Satisfaction</div>
                  <div className="text-3xl font-bold">{selectedEmployee.satisfactionScore}%</div>
                </div>
              </div>
            </div>
            <div 
              onMouseDown={startResizing}
              className="h-1.5 w-full cursor-ns-resize bg-slate-100 hover:bg-indigo-500/50 active:bg-indigo-600 transition-colors shrink-0 z-10" 
            />
            <div className="p-6 overflow-y-auto grow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <section>
                    <h3 className="flex items-center text-slate-900 font-bold mb-4 uppercase tracking-wider text-sm">
                      <Info className="h-4 w-4 mr-2 text-indigo-600" />
                      AI Risk Explanation
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {selectedEmployee.explanation}
                      </p>
                    </div>
                  </section>
                  <section>
                    <h3 className="flex items-center text-slate-900 font-bold mb-4 uppercase tracking-wider text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      Key Risk Factors
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedEmployee.riskFactors.map((factor, i) => (
                        <span key={i} className="px-5 py-2.5 bg-red-50 text-red-700 rounded-full text-sm font-semibold border border-red-100">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
                <div className="space-y-8">
                  <section>
                    <h3 className="flex items-center text-slate-900 font-bold mb-4 uppercase tracking-wider text-sm">
                      <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                      Retention Recommendations
                    </h3>
                    <div className="space-y-4">
                      {selectedEmployee.recommendations.map((rec, i) => (
                        <div key={i} className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start">
                          <div className="h-6 w-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold mr-4 mt-0.5 flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-amber-900 font-medium leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <DollarSign className="h-3 w-3 mr-1" /> Current Salary
                      </div>
                      <div className="text-xl font-bold text-slate-900">${selectedEmployee.salary.toLocaleString()}</div>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Calendar className="h-3 w-3 mr-1" /> Last Promotion
                      </div>
                      <div className="text-xl font-bold text-slate-900">{selectedEmployee.lastPromotion} years ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex space-x-4 shrink-0">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setPlanningEmployee(selectedEmployee);
                  setSelectedEmployee(null);
                }}
                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <Clock className="h-5 w-5 mr-2" />
                Start Conversation Plan
              </button>
              <button 
                onClick={() => exportIndividualPDF(selectedEmployee)}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AtRiskCard: React.FC<{ employee: Employee, onSelect: () => void, onPlan: () => void }> = ({ employee, onSelect, onPlan }) => (
  <div className="bg-white rounded-3xl border border-red-100 shadow-xl shadow-red-50/50 overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
    <div onClick={onSelect} className="p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{employee.name}</h3>
          <p className="text-red-100 text-sm">{employee.role} • {employee.department}</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-2 text-center">
          <div className="text-2xl font-extrabold">{employee.riskScore}%</div>
          <div className="text-[10px] font-bold uppercase tracking-tight opacity-80">Risk Level</div>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
        <AlertTriangle className="h-3.5 w-3.5 mr-2 text-red-500" />
        Primary Risk Factors
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {employee.riskFactors.slice(0, 2).map((factor, i) => (
          <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold border border-slate-100">
            {factor}
          </span>
        ))}
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onPlan(); }}
        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center group"
      >
        Plan Retention Meeting
        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);
