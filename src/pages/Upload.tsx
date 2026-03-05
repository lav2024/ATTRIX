import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { analyzeAttrition } from '../services/geminiService';
import { useApp } from '../context/AppContext';

export default function Upload() {
  const { user, setAnalyzedData } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setProgress(5);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 500);

    try {
      const rawData = await parseFile(file);
      
      if (!rawData || rawData.length === 0) {
        throw new Error("The file appears to be empty or invalid.");
      }

      const limitedData = rawData.slice(0, 500);
      const analyzed = await analyzeAttrition(limitedData);
      
      localStorage.removeItem(`results_scroll_pos_${user.id}`);
      localStorage.removeItem(`results_selected_id_${user.id}`);
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalyzedData(analyzed);
      
      setTimeout(() => {
        navigate('/results');
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to process data. Ensure your file is valid and API key is configured.");
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ["EmployeeID", "Name", "Email", "PhoneNumber", "Age", "Gender", "Department", "JobRole", "MonthlyIncome", "YearsAtCompany", "YearsInCurrentRole", "JobSatisfaction", "WorkLifeBalance", "PerformanceRating", "OverTime", "DistanceFromHome", "TrainingTimesLastYear", "PromotionsLast5Years", "Attrition"],
      ["1", "Rahul Gupta", "rahul.gupta@attrix.ai", "9533115106", "59", "Female", "IT", "Manager", "143557", "2", "8", "3", "2", "4", "Yes", "23", "1", "3", "Yes"],
      ["2", "Priya Nair", "priya.nair@attrix.ai", "9429760086", "49", "Male", "Finance", "Engineer", "42076", "19", "4", "1", "3", "1", "Yes", "25", "4", "3", "No"],
      ["3", "Rohit Rao", "rohit.rao@company.com", "9203232850", "35", "Male", "Sales", "Manager", "59605", "16", "2", "1", "3", "2", "No", "11", "0", "3", "No"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "ATTRIX_Employee_Template.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 md:p-12">
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Employee Dataset</h1>
              <p className="text-slate-500">Supported formats: .xlsx, .csv, .pdf, .docx. Ensure data includes:Department,Salary,Tenure,Satisfaction etc.. </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-bold"
              >
                <FileText className="h-4 w-4 mr-2" />
                Template
              </button>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
              ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".csv,.xlsx"
            />
            
            <div className="flex flex-col items-center">
              {file ? (
                <>
                  <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{file.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">Ready for analysis. Your file has been uploaded.</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 mb-4">
                    <UploadIcon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Click or drag to upload</h3>
                  <p className="text-slate-500 text-sm">Your data stays private and encrypted.</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-center">
            {isUploading ? (
              <div className="w-full">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>AI Analyzing Patterns...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-4 flex items-center justify-center text-indigo-600 text-sm font-medium">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking rows and columns for indicators...
                </div>
              </div>
            ) : (
              <button 
                disabled={!file}
                onClick={handleUpload}
                className={`
                  w-full max-w-xs py-4 rounded-xl font-bold text-white shadow-lg transition-all
                  ${file ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-300 cursor-not-allowed shadow-none'}
                `}
              >
                Start AI Prediction
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-slate-500 text-sm">
            <FileText className="h-4 w-4 mr-2" />
            <span>Example template available</span>
          </div>
          <button 
            onClick={downloadTemplate}
            className="text-indigo-600 text-sm font-bold hover:underline"
          >
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
}
