import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Subject {
  name: string;
  grade: number | null;
  status: 'V' | 'NV' | 'AC' | 'ABJ' | 'ABI';
}

export interface SemesterResult {
  id: string;
  studentId: string;
  studentName: string;
  semester: string;
  academicYear: string;
  subjects: Subject[];
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  fetchedAt: string;
}

interface ResultsContextType {
  currentResult: SemesterResult | null;
  history: SemesterResult[];
  recentSearches: string[];
  isLoading: boolean;
  error: string | null;
  fetchResults: (studentId: string) => Promise<void>;
  clearCache: () => Promise<void>;
  addToRecentSearches: (studentId: string) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

const RESULTS_STORAGE_KEY = '@fsjes_current_result';
const HISTORY_STORAGE_KEY = '@fsjes_history';
const RECENT_SEARCHES_KEY = '@fsjes_recent_searches';

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [currentResult, setCurrentResult] = useState<SemesterResult | null>(null);
  const [history, setHistory] = useState<SemesterResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedResult, storedHistory, storedSearches] = await Promise.all([
        AsyncStorage.getItem(RESULTS_STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
        AsyncStorage.getItem(RECENT_SEARCHES_KEY),
      ]);

      if (storedResult) {
        setCurrentResult(JSON.parse(storedResult));
      }
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (err) {
      console.error('Error loading stored data:', err);
    }
  };

  const addToRecentSearches = async (studentId: string) => {
    try {
      const updatedSearches = [studentId, ...recentSearches.filter(id => id !== studentId)].slice(0, 5);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (err) {
      console.error('Error saving recent search:', err);
    }
  };

  const fetchResults = async (studentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
        : '';
      
      const response = await fetch(`${baseUrl}/api/results/${studentId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch results');
      }

      const data: SemesterResult = await response.json();
      
      setCurrentResult(data);
      await AsyncStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(data));

      const existingIndex = history.findIndex(h => h.id === data.id);
      let updatedHistory: SemesterResult[];
      
      if (existingIndex >= 0) {
        updatedHistory = [...history];
        updatedHistory[existingIndex] = data;
      } else {
        updatedHistory = [data, ...history].slice(0, 10);
      }
      
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      
      await addToRecentSearches(studentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(RESULTS_STORAGE_KEY),
        AsyncStorage.removeItem(HISTORY_STORAGE_KEY),
        AsyncStorage.removeItem(RECENT_SEARCHES_KEY),
      ]);
      setCurrentResult(null);
      setHistory([]);
      setRecentSearches([]);
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };

  const removeFromHistory = async (id: string) => {
    try {
      const updatedHistory = history.filter(h => h.id !== id);
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      
      if (currentResult?.id === id) {
        setCurrentResult(null);
        await AsyncStorage.removeItem(RESULTS_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error removing from history:', err);
    }
  };

  const value: ResultsContextType = {
    currentResult,
    history,
    recentSearches,
    isLoading,
    error,
    fetchResults,
    clearCache,
    addToRecentSearches,
    removeFromHistory,
  };

  return (
    <ResultsContext.Provider value={value}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}
