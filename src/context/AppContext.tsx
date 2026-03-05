import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Employee, Meeting } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppContextType {
  user: User | null;
  analyzedData: Employee[];
  meetings: Meeting[];
  login: (u: User) => void;
  logout: () => void;
  setAnalyzedData: (data: Employee[]) => void;
  addMeeting: (meeting: Meeting) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [analyzedData, setAnalyzedData] = useState<Employee[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('attrix_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      const userData = localStorage.getItem(`attrix_data_${parsedUser.id}`);
      if (userData) {
        setAnalyzedData(JSON.parse(userData));
      }

      const userMeetings = localStorage.getItem(`attrix_meetings_${parsedUser.id}`);
      if (userMeetings) {
        setMeetings(JSON.parse(userMeetings));
      }
    }
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('attrix_user', JSON.stringify(u));
    
    const userData = localStorage.getItem(`attrix_data_${u.id}`);
    setAnalyzedData(userData ? JSON.parse(userData) : []);

    const userMeetings = localStorage.getItem(`attrix_meetings_${u.id}`);
    setMeetings(userMeetings ? JSON.parse(userMeetings) : []);
    
    navigate('/upload');
  };

  const logout = () => {
    setUser(null);
    setAnalyzedData([]);
    setMeetings([]);
    localStorage.removeItem('attrix_user');
    navigate('/');
  };

  const handleSetAnalyzedData = (data: Employee[]) => {
    setAnalyzedData(data);
    if (user) {
      localStorage.setItem(`attrix_data_${user.id}`, JSON.stringify(data));
    }
  };

  const addMeeting = (meeting: Meeting) => {
    if (user) {
      const updatedMeetings = [...meetings, meeting];
      setMeetings(updatedMeetings);
      localStorage.setItem(`attrix_meetings_${user.id}`, JSON.stringify(updatedMeetings));
    }
  };

  // Protected routes logic
  useEffect(() => {
    const protectedRoutes = ['/upload', '/outcome', '/results', '/dashboard'];
    const authRoutes = ['/login', '/register'];
    const pathname = location.pathname;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && isProtectedRoute) {
      navigate('/login');
    }

    if (user && isAuthRoute) {
      navigate('/upload');
    }
  }, [user, location.pathname, navigate]);

  return (
    <AppContext.Provider value={{ 
      user, 
      analyzedData, 
      meetings, 
      login, 
      logout, 
      setAnalyzedData: handleSetAnalyzedData, 
      addMeeting 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
