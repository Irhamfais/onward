'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UnifiedTask, Course, Competition, Committee, TaskStatus, TaskCategory } from '@/types';
import { INITIAL_TASKS, INITIAL_COURSES, INITIAL_COMPETITIONS, INITIAL_COMMITTEES } from '@/lib/constants';

interface AppContextType {
  tasks: UnifiedTask[];
  courses: Course[];
  competitions: Competition[];
  committees: Committee[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  cycleTaskStatus: (taskId: string) => void;
  addTask: (task: Omit<UnifiedTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  addCompetition: (comp: Omit<Competition, 'id'>) => void;
  addCommittee: (committee: Omit<Committee, 'id'>) => void;
  resetDemoData: () => void;
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    completionPercentage: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'ONWARD_APP_STATE_V2';
const SIDEBAR_STORAGE_KEY = 'ONWARD_SIDEBAR_COLLAPSED';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<UnifiedTask[]>(INITIAL_TASKS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [committees, setCommittees] = useState<Committee[]>(INITIAL_COMMITTEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.competitions) setCompetitions(parsed.competitions);
        if (parsed.committees) setCommittees(parsed.committees);
      }

      const savedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedSidebar === 'true' && window.innerWidth >= 768) {
        setIsSidebarCollapsed(true);
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever core data changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = { tasks, courses, competitions, committees };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [tasks, courses, competitions, committees, isInitialized]);

  // Keyboard shortcut Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next.toString());
      return next;
    });
  };

  const cycleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        let nextStatus: TaskStatus = 'SEDANG_DIKERJAKAN';
        if (t.status === 'BELUM_MULAI') nextStatus = 'SEDANG_DIKERJAKAN';
        else if (t.status === 'SEDANG_DIKERJAKAN') nextStatus = 'SELESAI';
        else if (t.status === 'SELESAI') nextStatus = 'BELUM_MULAI';
        return { ...t, status: nextStatus };
      })
    );
  };

  const addTask = (taskData: Omit<UnifiedTask, 'id'>) => {
    const newTask: UnifiedTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const addCompetition = (compData: Omit<Competition, 'id'>) => {
    const newComp: Competition = {
      ...compData,
      id: `lomba-${Date.now()}`,
    };
    setCompetitions((prev) => [newComp, ...prev]);
  };

  const addCommittee = (commData: Omit<Committee, 'id'>) => {
    const newComm: Committee = {
      ...commData,
      id: `org-${Date.now()}`,
    };
    setCommittees((prev) => [newComm, ...prev]);
  };

  const resetDemoData = () => {
    setTasks(INITIAL_TASKS);
    setCourses(INITIAL_COURSES);
    setCompetitions(INITIAL_COMPETITIONS);
    setCommittees(INITIAL_COMMITTEES);
    localStorage.removeItem(STORAGE_KEY);
  };

  const total = tasks.length;
  const notStarted = tasks.filter((t) => t.status === 'BELUM_MULAI').length;
  const inProgress = tasks.filter((t) => t.status === 'SEDANG_DIKERJAKAN').length;
  const completed = tasks.filter((t) => t.status === 'SELESAI').length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AppContext.Provider
      value={{
        tasks,
        courses,
        competitions,
        committees,
        searchQuery,
        setSearchQuery,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        cycleTaskStatus,
        addTask,
        deleteTask,
        addCourse,
        addCompetition,
        addCommittee,
        resetDemoData,
        stats: { total, notStarted, inProgress, completed, completionPercentage },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
