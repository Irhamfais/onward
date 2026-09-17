'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { UnifiedTask, Course, Competition, Committee, TaskStatus, UserProfile, Semester } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AppContextType {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;

  // Core Data
  tasks: UnifiedTask[];
  courses: Course[];
  competitions: Competition[];
  committees: Committee[];
  semesters: Semester[];
  activeSemesterId: string | null;
  setActiveSemesterId: (id: string) => void;
  addSemester: (sem: Omit<Semester, 'id'>) => void;
  archiveSemester: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  cycleTaskStatus: (taskId: string) => void;
  addTask: (task: Omit<UnifiedTask, 'id'>) => void;
  updateTask: (taskId: string, task: Partial<UnifiedTask>) => void;
  deleteTask: (taskId: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (courseId: string, course: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addCompetition: (comp: Omit<Competition, 'id'>) => void;
  addCommittee: (committee: Omit<Committee, 'id'>) => void;
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    completionPercentage: number;
  };
  updateProfile: (updated: Partial<UserProfile>) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'ONWARD_SIDEBAR_COLLAPSED';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Default Semesters
  const defaultSemesters: Semester[] = [
    { id: 'sem-ganjil-2026', name: 'Ganjil 2026/2027', is_active: true }
  ];

  // Application Data States (Pure empty arrays, no dummy data)
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>(defaultSemesters);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>('sem-ganjil-2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Helper to load user profile
  const loadUserProfile = useCallback(async (userId: string, email?: string, metadata?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as UserProfile);
      } else {
        // Fallback to auth metadata
        const fallbackName = metadata?.full_name || metadata?.name || email?.split('@')[0] || 'Mahasiswa';
        setProfile({
          id: userId,
          name: fallbackName,
          email: email || '',
          major: metadata?.major || 'Mahasiswa Onward',
          is_wa_verified: false,
        });
      }
    } catch {
      const fallbackName = metadata?.full_name || metadata?.name || email?.split('@')[0] || 'Mahasiswa';
      setProfile({
        id: userId,
        name: fallbackName,
        email: email || '',
        major: metadata?.major || 'Mahasiswa Onward',
        is_wa_verified: false,
      });
    }
  }, [supabase]);

  // Helper to load user data from user-scoped storage
  const loadUserData = useCallback((userId: string) => {
    try {
      const userKey = `ONWARD_DATA_${userId}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTasks(parsed.tasks || []);
        setCourses(parsed.courses || []);
        setCompetitions(parsed.competitions || []);
        setCommittees(parsed.committees || []);
        const loadedSemesters: Semester[] = parsed.semesters && parsed.semesters.length > 0
          ? parsed.semesters
          : [{ id: 'sem-ganjil-2026', name: 'Ganjil 2026/2027', is_active: true }];
        setSemesters(loadedSemesters);
        setActiveSemesterId(parsed.activeSemesterId || loadedSemesters.find(s => s.is_active)?.id || loadedSemesters[0]?.id || null);
      } else {
        setTasks([]);
        setCourses([]);
        setCompetitions([]);
        setCommittees([]);
        setSemesters([{ id: 'sem-ganjil-2026', name: 'Ganjil 2026/2027', is_active: true }]);
        setActiveSemesterId('sem-ganjil-2026');
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  // Sync session and auth state on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await loadUserProfile(currentUser.id, currentUser.email, currentUser.user_metadata);
            loadUserData(currentUser.id);
          } else {
            setIsDataLoaded(true);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    initAuth();

    // Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser.id, currentUser.email, currentUser.user_metadata);
        loadUserData(currentUser.id);
      } else {
        setProfile(null);
        setTasks([]);
        setCourses([]);
        setCompetitions([]);
        setCommittees([]);
        setIsDataLoaded(true);
      }
      setIsLoadingAuth(false);
    });

    // Load sidebar preference
    try {
      const savedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedSidebar === 'true' && typeof window !== 'undefined' && window.innerWidth >= 768) {
        setIsSidebarCollapsed(true);
      }
    } catch {}

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadUserProfile, loadUserData]);

  // Save changes to user-scoped storage whenever state changes
  useEffect(() => {
    if (!user || !isDataLoaded) return;
    try {
      const userKey = `ONWARD_DATA_${user.id}`;
      const payload = { tasks, courses, competitions, committees, semesters, activeSemesterId };
      localStorage.setItem(userKey, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving user data:', e);
    }
  }, [tasks, courses, competitions, committees, semesters, activeSemesterId, user, isDataLoaded]);

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
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next.toString());
      return next;
    });
  };

  const addSemester = (semData: Omit<Semester, 'id'>) => {
    const newSem: Semester = {
      ...semData,
      id: `sem-${Date.now()}`,
    };
    setSemesters((prev) => {
      if (newSem.is_active) {
        return [newSem, ...prev.map((s) => ({ ...s, is_active: false }))];
      }
      return [...prev, newSem];
    });
    if (newSem.is_active) {
      setActiveSemesterId(newSem.id);
    }
  };

  const archiveSemester = (id: string) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: false } : s))
    );
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
      user_id: user?.id,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (taskId: string, taskData: Partial<UnifiedTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...taskData } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`,
      semester_id: courseData.semester_id || activeSemesterId || undefined,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const updateCourse = (courseId: string, courseData: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...courseData } : c))
    );
    if (courseData.course_name) {
      setTasks((prev) =>
        prev.map((t) => (t.parent_id === courseId ? { ...t, parent_title: courseData.course_name! } : t))
      );
    }
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setTasks((prev) => prev.filter((t) => t.parent_id !== courseId));
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setTasks([]);
      setCourses([]);
      setCompetitions([]);
      setCommittees([]);
      window.location.href = '/login';
    } catch (e) {
      console.error('SignOut error:', e);
      window.location.href = '/login';
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const merged: UserProfile = {
        id: user.id,
        name: updated.name ?? profile?.name ?? 'Mahasiswa',
        email: user.email ?? profile?.email ?? '',
        major: updated.major ?? profile?.major ?? 'Mahasiswa Onward',
        semester: updated.semester ?? profile?.semester ?? 1,
        phone_wa: updated.phone_wa ?? profile?.phone_wa ?? '',
        is_wa_verified: updated.is_wa_verified ?? profile?.is_wa_verified ?? false,
        avatar_url: updated.avatar_url ?? profile?.avatar_url,
      };
      setProfile(merged);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: merged.name,
          email: merged.email,
          phone_wa: merged.phone_wa,
          major: merged.major,
          semester: merged.semester,
          is_wa_verified: merged.is_wa_verified,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('Could not sync to Supabase profiles:', error.message);
      }
      return true;
    } catch (e) {
      console.error('Update profile error:', e);
      return false;
    }
  };

  const total = tasks.length;
  const notStarted = tasks.filter((t) => t.status === 'BELUM_MULAI').length;
  const inProgress = tasks.filter((t) => t.status === 'SEDANG_DIKERJAKAN').length;
  const completed = tasks.filter((t) => t.status === 'SELESAI').length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        isLoadingAuth,
        signOut,
        tasks,
        courses,
        competitions,
        committees,
        semesters,
        activeSemesterId,
        setActiveSemesterId,
        addSemester,
        archiveSemester,
        searchQuery,
        setSearchQuery,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        cycleTaskStatus,
        addTask,
        updateTask,
        deleteTask,
        addCourse,
        updateCourse,
        deleteCourse,
        addCompetition,
        addCommittee,
        updateProfile,
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
