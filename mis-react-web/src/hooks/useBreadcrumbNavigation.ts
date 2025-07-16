import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumbStore } from '@/zustand/breadcrumbStore';

// Define the mapping of routes to breadcrumb labels
const routeToLabel: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/manage-user': 'Manage User',
  '/manage-branch': 'Manage Branch',
  '/monthly': 'Monthly',
  '/daily': 'Daily',
  '/approve-data': 'Approve Data',
  '/status': 'Status',
  '/profile': 'Profile',
};

export const useBreadcrumbNavigation = () => {
  const location = useLocation();
  const { addBreadcrumb, clearBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    const path = location.pathname;
    
    console.log('useBreadcrumbNavigation - Path changed to:', path);
    
    // Skip if it's the dashboard (home)
    if (path === '/dashboard') {
      console.log('useBreadcrumbNavigation - Clearing breadcrumbs for dashboard');
      clearBreadcrumbs();
      return;
    }

    // Get the label for this route
    const label = routeToLabel[path] || 'Unknown Page';
    
    // Create a unique ID for this breadcrumb
    const breadcrumbId = path.replace(/\//g, '-').substring(1) || 'dashboard';
    
    console.log('useBreadcrumbNavigation - Adding breadcrumb:', {
      id: breadcrumbId,
      label,
      path
    });
    
    // Add the breadcrumb
    addBreadcrumb({
      id: breadcrumbId,
      label,
      path,
      state: location.state // Preserve any route state
    });
  }, [location.pathname, addBreadcrumb, clearBreadcrumbs]);

  return {
    addBreadcrumb,
    clearBreadcrumbs
  };
}; 