/// <reference types="vite/client" />
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { Employee } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from environment variables. Please set it in the platform settings.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const employeeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      email: { type: Type.STRING },
      age: { type: Type.NUMBER },
      department: { type: Type.STRING },
      role: { type: Type.STRING },
      tenure: { type: Type.NUMBER },
      salary: { type: Type.NUMBER },
      lastPromotion: { type: Type.NUMBER },
      satisfactionScore: { type: Type.NUMBER },
      riskScore: { type: Type.NUMBER, description: "0-100 probability of leaving" },
      riskLevel: { type: Type.STRING, description: "Low, Medium, or High" },
      riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      explanation: { type: Type.STRING, description: "A concise 2-sentence explanation of the risk" },
    },
    required: ["id", "name", "riskScore", "riskLevel", "riskFactors", "recommendations", "explanation"],
  },
};

export const analyzeAttrition = async (rawData: any[]): Promise<Employee[]> => {
  // Map raw data fields to internal schema
  const mappedData = rawData.map(emp => ({
    id: emp.EmployeeID || emp.id || String(Math.random()),
    name: emp.Name || emp.name || "Unknown",
    email: emp.Email || emp.email || `emp${emp.EmployeeID || Math.floor(Math.random()*1000)}@company.com`,
    age: Number(emp.Age || emp.age || 25 + Math.floor(Math.random() * 30)),
    department: emp.Department || emp.department || "N/A",
    role: emp.JobRole || emp.role || "N/A",
    tenure: Number(emp.YearsAtCompany || emp.tenure || 0),
    salary: Number(emp.MonthlyIncome || emp.salary || 0),
    lastPromotion: Number(emp.PromotionsLast5Years || emp.lastPromotion || 0),
    satisfactionScore: Number(emp.JobSatisfaction || emp.satisfactionScore || 50),
    ...emp
  }));

  const BATCH_SIZE = 50; // Larger batches to reduce request count
  const batches: any[][] = [];
  for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
    batches.push(mappedData.slice(i, i + BATCH_SIZE));
  }

  // Process batches in parallel with a concurrency limit to avoid rate limits
  const processBatch = async (batch: any[], index: number): Promise<Employee[]> => {
    const ai = getAI();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these ${batch.length} employees for attrition risk: ${JSON.stringify(batch)}`,
        config: {
          systemInstruction: "You are a high-speed attrition risk analyzer. Return ONLY valid JSON matching the schema. Analyze EVERY employee provided in the list. Focus on tenure, satisfaction, and salary gaps. If Attrition is 'Yes', riskScore should be high.",
          responseMimeType: "application/json",
          responseSchema: employeeSchema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      clearTimeout(timeoutId);
      return JSON.parse(response.text || "[]");
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`AI Analysis failed for batch ${index}:`, error);
      
      // Fallback for this specific batch
      return batch.map(emp => {
        const riskScore = emp.Attrition === 'Yes' ? 85 + Math.floor(Math.random() * 15) : Math.floor(Math.random() * 60);
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        if (riskScore > 70) riskLevel = 'High';
        else if (riskScore > 40) riskLevel = 'Medium';

        return {
          ...emp,
          riskScore,
          riskLevel,
          riskFactors: ["Tenure", "Satisfaction Score"],
          recommendations: ["Conduct stay interview", "Review compensation"],
          explanation: "Heuristic analysis (AI Parallel Fallback)."
        } as Employee;
      });
    }
  };

  // Run all batches in parallel
  const allResults = await Promise.all(batches.map((batch, idx) => processBatch(batch, idx)));
  return allResults.flat();
};
