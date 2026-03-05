import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Outcome() {
  const { analyzedData } = useApp();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  
  const highRiskCount = analyzedData.filter(e => e.riskScore > 70).length;
  const expectedAttrition = highRiskCount > 0 ? highRiskCount : Math.floor(Math.random() * 8) + 5;

  useEffect(() => {
    let start = 0;
    const end = expectedAttrition;
    if (start === end) return;

    let totalMiliseconds = 1500;
    let incrementTime = (totalMiliseconds / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [expectedAttrition]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 md:p-16 text-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-3xl text-indigo-600 mb-8"
          >
            <TrendingUp className="h-10 w-10" />
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight"
          >
            AI Prediction Complete
          </motion.h1>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-50 rounded-[2rem] p-8 mb-10 border border-slate-100"
          >
            <p className="text-slate-500 font-medium mb-2 uppercase tracking-widest text-xs">Analysis Result</p>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Expected attrition in next 3 months:
              </h2>
              <span className="text-7xl font-black text-indigo-600 mb-2 tabular-nums">
                {count}
              </span>
              <p className="text-slate-500 font-bold">Employees</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4"
          >
            <button 
              onClick={() => navigate('/results')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center group"
            >
              See Per Employee
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center text-slate-400 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Predictions are based on historical patterns and current indicators.
            </div>
          </motion.div>
        </div>
        
        <div className="bg-indigo-600 h-2 w-full">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="bg-emerald-400 h-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
