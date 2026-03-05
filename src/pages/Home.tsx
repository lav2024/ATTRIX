import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Zap, BrainCircuit, ChevronRight } from 'lucide-react';

export default function Home() {
  const { user } = useApp();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Predict Attrition <br />
              <span className="text-indigo-600 italic">Before it Happens</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              ATTRIX uses advanced AI to analyze employee data, predict turnover risks, and provide actionable recommendations to keep your top talent.
            </p>
            <div className="flex justify-center">
              {user ? (
                <Link to="/dashboard" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center">
                  Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link to="/login" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center">
                  Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<BrainCircuit className="h-8 w-8 text-indigo-600" />}
              title="AI-Powered Insights"
              description="Our proprietary Gemini-backed engine understands complex patterns in performance, satisfaction, and work habits."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-indigo-600" />}
              title="Instant Recommendations"
              description="Don't just see who's leaving; get bespoke retention strategies for every high-risk employee automatically."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-indigo-600" />}
              title="Data Privacy First"
              description="Enterprise-grade security ensuring your sensitive employee information remains protected and confidential."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-16">Why HR Leaders Choose ATTRIX</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Retention Boost" value="32%" />
            <StatItem label="Prediction Accuracy" value="94%" />
            <StatItem label="Time Saved" value="15hr/wk" />
            <StatItem label="Cost Reduction" value="20%" />
          </div>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <div className="text-4xl font-extrabold text-indigo-600 mb-2">{value}</div>
    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</div>
  </div>
);
