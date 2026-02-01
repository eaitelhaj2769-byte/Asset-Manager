import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'fr' | 'ar';

interface Translations {
  appName: string;
  disclaimer: string;
  home: string;
  results: string;
  history: string;
  settings: string;
  enterStudentId: string;
  studentIdPlaceholder: string;
  viewResults: string;
  recentSearches: string;
  noRecentSearches: string;
  loading: string;
  error: string;
  retry: string;
  subject: string;
  grade: string;
  status: string;
  passed: string;
  failed: string;
  passedIntegration: string;
  justifiedAbsence: string;
  unjustifiedAbsence: string;
  semesterGpa: string;
  gpaDisclaimer: string;
  credits: string;
  passedSubjects: string;
  failedSubjects: string;
  noResultsYet: string;
  enterIdFirst: string;
  noHistory: string;
  gpaOverTime: string;
  language: string;
  arabic: string;
  french: string;
  english: string;
  appearance: string;
  lightMode: string;
  darkMode: string;
  dataManagement: string;
  clearCache: string;
  cacheCleared: string;
  about: string;
  designedBy: string;
  invalidStudentId: string;
  networkError: string;
  semester: string;
  academicYear: string;
  summary: string;
  refresh: string;
  share: string;
  export: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'FSJES UCA Results+',
    disclaimer: 'This application is developed by students and is not affiliated with the college.',
    home: 'Home',
    results: 'Results',
    history: 'History',
    settings: 'Settings',
    enterStudentId: 'Enter your Student ID',
    studentIdPlaceholder: 'Student ID (Apogee)',
    viewResults: 'View Results',
    recentSearches: 'Recent Searches',
    noRecentSearches: 'No recent searches',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    subject: 'Subject',
    grade: 'Grade',
    status: 'Status',
    passed: 'Passed',
    failed: 'Failed',
    passedIntegration: 'Passed (Integration)',
    justifiedAbsence: 'Justified Absence',
    unjustifiedAbsence: 'Unjustified Absence',
    semesterGpa: 'Semester GPA',
    gpaDisclaimer: 'This GPA is calculated automatically (sum of grades / number of subjects). Please wait for the official result from the university.',
    credits: 'Credits',
    passedSubjects: 'Passed',
    failedSubjects: 'Failed',
    noResultsYet: 'No results yet',
    enterIdFirst: 'Enter your student ID on the Home screen to view your results',
    noHistory: 'No history available',
    gpaOverTime: 'GPA Over Time',
    language: 'Language',
    arabic: 'Arabic',
    french: 'French',
    english: 'English',
    appearance: 'Appearance',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    dataManagement: 'Data Management',
    clearCache: 'Clear Cache',
    cacheCleared: 'Cache cleared successfully',
    about: 'About',
    designedBy: 'Designed by El Mahdi',
    invalidStudentId: 'Please enter a valid student ID',
    networkError: 'Network error. Please check your connection.',
    semester: 'Semester',
    academicYear: 'Academic Year',
    summary: 'Summary',
    refresh: 'Refresh',
    share: 'Share',
    export: 'Export',
  },
  fr: {
    appName: 'FSJES UCA Results+',
    disclaimer: 'Cette application est développée par des étudiants et n\'est pas affiliée à la faculté.',
    home: 'Accueil',
    results: 'Résultats',
    history: 'Historique',
    settings: 'Paramètres',
    enterStudentId: 'Entrez votre numéro étudiant',
    studentIdPlaceholder: 'Numéro étudiant (Apogée)',
    viewResults: 'Voir les résultats',
    recentSearches: 'Recherches récentes',
    noRecentSearches: 'Aucune recherche récente',
    loading: 'Chargement...',
    error: 'Une erreur s\'est produite',
    retry: 'Réessayer',
    subject: 'Matière',
    grade: 'Note',
    status: 'Statut',
    passed: 'Validé',
    failed: 'Non validé',
    passedIntegration: 'Validé (Intégration)',
    justifiedAbsence: 'Absence justifiée',
    unjustifiedAbsence: 'Absence injustifiée',
    semesterGpa: 'Moyenne du semestre',
    gpaDisclaimer: 'Cette moyenne est calculée automatiquement (somme des notes / nombre de matières). Veuillez attendre le résultat officiel de l\'université.',
    credits: 'Crédits',
    passedSubjects: 'Validés',
    failedSubjects: 'Non validés',
    noResultsYet: 'Pas encore de résultats',
    enterIdFirst: 'Entrez votre numéro étudiant sur l\'écran d\'accueil pour voir vos résultats',
    noHistory: 'Aucun historique disponible',
    gpaOverTime: 'Évolution de la moyenne',
    language: 'Langue',
    arabic: 'Arabe',
    french: 'Français',
    english: 'Anglais',
    appearance: 'Apparence',
    lightMode: 'Mode clair',
    darkMode: 'Mode sombre',
    dataManagement: 'Gestion des données',
    clearCache: 'Vider le cache',
    cacheCleared: 'Cache vidé avec succès',
    about: 'À propos',
    designedBy: 'Conçu par El Mahdi',
    invalidStudentId: 'Veuillez entrer un numéro étudiant valide',
    networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
    semester: 'Semestre',
    academicYear: 'Année universitaire',
    summary: 'Résumé',
    refresh: 'Actualiser',
    share: 'Partager',
    export: 'Exporter',
  },
  ar: {
    appName: 'FSJES UCA Results+',
    disclaimer: 'هذا التطبيق من تطوير طلاب وليس له علاقة بإدارة الكلية.',
    home: 'الرئيسية',
    results: 'النتائج',
    history: 'السجل',
    settings: 'الإعدادات',
    enterStudentId: 'أدخل رقم الطالب الخاص بك',
    studentIdPlaceholder: 'رقم الطالب (أبوجي)',
    viewResults: 'عرض النتائج',
    recentSearches: 'عمليات البحث الأخيرة',
    noRecentSearches: 'لا توجد عمليات بحث حديثة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    subject: 'المادة',
    grade: 'الدرجة',
    status: 'الحالة',
    passed: 'ناجح',
    failed: 'راسب',
    passedIntegration: 'ناجح (تكامل)',
    justifiedAbsence: 'غياب مبرر',
    unjustifiedAbsence: 'غياب غير مبرر',
    semesterGpa: 'معدل الفصل',
    gpaDisclaimer: 'هذا المعدل محسوب تلقائياً (مجموع الدرجات / عدد المواد). يرجى انتظار النتيجة الرسمية من الجامعة.',
    credits: 'الرصيد',
    passedSubjects: 'ناجح',
    failedSubjects: 'راسب',
    noResultsYet: 'لا توجد نتائج بعد',
    enterIdFirst: 'أدخل رقم الطالب في الشاشة الرئيسية لعرض نتائجك',
    noHistory: 'لا يوجد سجل متاح',
    gpaOverTime: 'تطور المعدل',
    language: 'اللغة',
    arabic: 'العربية',
    french: 'الفرنسية',
    english: 'الإنجليزية',
    appearance: 'المظهر',
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    dataManagement: 'إدارة البيانات',
    clearCache: 'مسح الذاكرة المؤقتة',
    cacheCleared: 'تم مسح الذاكرة المؤقتة بنجاح',
    about: 'حول',
    designedBy: 'تصميم المهدي',
    invalidStudentId: 'الرجاء إدخال رقم طالب صحيح',
    networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    semester: 'الفصل',
    academicYear: 'السنة الدراسية',
    summary: 'ملخص',
    refresh: 'تحديث',
    share: 'مشاركة',
    export: 'تصدير',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@fsjes_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr' || savedLanguage === 'ar')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: language === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
