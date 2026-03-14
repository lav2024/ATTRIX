export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  age?: number;
  department: string;
  role: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  lastPerformance?: number;
  satisfactionScore: number;
  tenure: number;
  recommendations: string[];
  riskFactors: string[];
  explanation: string;
  salary: number;
  lastPromotion: number;
}

export interface Meeting {
  id: string;
  employeeId?: string;
  employeeName: string;
  employeeRole?: string;
  date: string;
  time: string;
  notes?: string;
}
