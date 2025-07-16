import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumbStore } from '@/zustand/breadcrumbStore';

export const usePageState = () => {
  const location = useLocation();
  const { breadcrumbs } = useBreadcrumbStore();
  
  // Generate breadcrumb ID from current path
  const breadcrumbId = location.pathname.replace(/\//g, '-').substring(1) || 'dashboard';
  
  // Find current breadcrumb
  const currentBreadcrumb = breadcrumbs.find(b => b.id === breadcrumbId);
  
  // Save page state
  const savePageState = useCallback((state: any) => {
    // For now, we'll use localStorage as a simple solution
    localStorage.setItem(`pageState_${breadcrumbId}`, JSON.stringify(state));
  }, [breadcrumbId]);
  
  // Get page state
  const getPageState = useCallback((defaultValue: any = {}) => {
    const saved = localStorage.getItem(`pageState_${breadcrumbId}`);
    return saved ? JSON.parse(saved) : defaultValue;
  }, [breadcrumbId]);
  
  // Save specific property
  const saveProperty = useCallback((key: string, value: any) => {
    const currentState = getPageState();
    const newState = { ...currentState, [key]: value };
    savePageState(newState);
  }, [getPageState, savePageState]);
  
  // Get specific property
  const getProperty = useCallback((key: string, defaultValue?: any) => {
    const state = getPageState();
    return state[key] ?? defaultValue;
  }, [getPageState]);
  
  return {
    savePageState,
    getPageState,
    saveProperty,
    getProperty,
    breadcrumbId
  };
}; 