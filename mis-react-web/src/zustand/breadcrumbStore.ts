import { create } from 'zustand';

export interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  state?: any; // Store page state here
  isActive?: boolean; // Track if this is the current active page
}

interface BreadcrumbStore {
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  
  // Actions
  addBreadcrumb: (item: BreadcrumbItem) => void;
  removeBreadcrumb: (id: string) => void;
  clearBreadcrumbs: () => void;
  navigateToBreadcrumb: (id: string) => void;
  updateCurrentPath: (path: string) => void;
  setActiveBreadcrumb: (id: string) => void;
  clearAllPageStates: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set, get) => ({
  breadcrumbs: [],
  currentPath: '/dashboard',

  addBreadcrumb: (item: BreadcrumbItem) => {
    set((state) => {
      // Check if this breadcrumb already exists
      const existingIndex = state.breadcrumbs.findIndex(b => b.id === item.id);
      
      if (existingIndex !== -1) {
        // If item already exists, just update it and set it as active
        const updatedBreadcrumbs = state.breadcrumbs.map((breadcrumb, index) => ({
          ...breadcrumb,
          isActive: index === existingIndex
        }));
        
        return {
          breadcrumbs: updatedBreadcrumbs,
          currentPath: item.path
        };
      } else {
        // If it's a new item, add it to the end and set it as active
        const updatedBreadcrumbs = state.breadcrumbs.map(breadcrumb => ({
          ...breadcrumb,
          isActive: false
        }));
        
        return {
          breadcrumbs: [...updatedBreadcrumbs, { ...item, isActive: true }],
          currentPath: item.path
        };
      }
    });
  },

  removeBreadcrumb: (id: string) => {
    set((state) => ({
      breadcrumbs: state.breadcrumbs.filter(b => b.id !== id)
    }));
  },

  clearBreadcrumbs: () => {
    set({
      breadcrumbs: [],
      currentPath: '/dashboard'
    });
  },

  navigateToBreadcrumb: (id: string) => {
    const { breadcrumbs } = get();
    const targetBreadcrumb = breadcrumbs.find(b => b.id === id);
    
    if (targetBreadcrumb) {
      set((state) => ({
        breadcrumbs: state.breadcrumbs.map(breadcrumb => ({
          ...breadcrumb,
          isActive: breadcrumb.id === id
        })),
        currentPath: targetBreadcrumb.path
      }));
    }
  },

  updateCurrentPath: (path: string) => {
    set({ currentPath: path });
  },

  setActiveBreadcrumb: (id: string) => {
    set((state) => ({
      breadcrumbs: state.breadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        isActive: breadcrumb.id === id
      }))
    }));
  },

  clearAllPageStates: () => {
    // Clear all page state items from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pageState_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
})); 