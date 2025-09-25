// =============================================================================
// NAVIGATION CONTEXT - Centralized Navigation State Management
// =============================================================================

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  NavigationState, 
  BreadcrumbItem, 
  getBreadcrumbs, 
  isRouteAccessible,
  initialNavigationState 
} from '../constants/navigation';
import { useAuth } from './AuthContextFixed';

// =============================================================================
// NAVIGATION ACTION TYPES
// =============================================================================

type NavigationAction =
  | { type: 'SET_CURRENT_PATH'; payload: string }
  | { type: 'SET_PREVIOUS_PATH'; payload: string }
  | { type: 'SET_BREADCRUMBS'; payload: BreadcrumbItem[] }
  | { type: 'SET_NAVIGATING'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'NAVIGATE_TO'; payload: string }
  | { type: 'GO_BACK' }
  | { type: 'RESET_NAVIGATION' };

// =============================================================================
// NAVIGATION REDUCER
// =============================================================================

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_CURRENT_PATH':
      return {
        ...state,
        currentPath: action.payload,
        previousPath: state.currentPath,
        breadcrumbs: getBreadcrumbs('', action.payload) // Will be updated by effect
      };
    
    case 'SET_PREVIOUS_PATH':
      return {
        ...state,
        previousPath: action.payload
      };
    
    case 'SET_BREADCRUMBS':
      return {
        ...state,
        breadcrumbs: action.payload
      };
    
    case 'SET_NAVIGATING':
      return {
        ...state,
        isNavigating: action.payload
      };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload].slice(-10) // Keep last 10
      };
    
    case 'NAVIGATE_TO':
      return {
        ...state,
        currentPath: action.payload,
        previousPath: state.currentPath,
        isNavigating: true,
        navigationHistory: [...state.navigationHistory, action.payload].slice(-10)
      };
    
    case 'GO_BACK': {
      const newHistory = [...state.navigationHistory];
      newHistory.pop(); // Remove current
      const previousPath = newHistory[newHistory.length - 1] || '/';
      return {
        ...state,
        currentPath: previousPath,
        previousPath: state.currentPath,
        navigationHistory: newHistory
      };
    }
    
    case 'RESET_NAVIGATION':
      return initialNavigationState;
    
    default:
      return state;
  }
}

// =============================================================================
// NAVIGATION CONTEXT INTERFACE
// =============================================================================

interface NavigationContextType {
  // State
  currentPath: string;
  previousPath: string;
  breadcrumbs: BreadcrumbItem[];
  isNavigating: boolean;
  navigationHistory: string[];
  
  // Actions
  navigateTo: (path: string) => void;
  navigateDirect: (path: string, options?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  isRouteAccessible: (path: string) => boolean;
  getBreadcrumbs: () => BreadcrumbItem[];
  resetNavigation: () => void;
  
  // Navigation helpers
  navigateToCase: (caseId: string) => void;
  navigateToUser: (userId: string) => void;
  navigateToDocument: (documentId: string, caseId?: string) => void;
  navigateToComplianceIssue: (issueId: string) => void;
  navigateToLoanApplication: (applicationId: string) => void;
  navigateToTaskCategory: (categoryId: string) => void;
}

// =============================================================================
// NAVIGATION CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// =============================================================================
// NAVIGATION PROVIDER
// =============================================================================

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, dispatch] = useReducer(navigationReducer, initialNavigationState);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Update current path when location changes
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_PATH', payload: location.pathname });
  }, [location.pathname]);

  // Update breadcrumbs when path or user role changes
  useEffect(() => {
    if (user?.role) {
      const breadcrumbs = getBreadcrumbs(user.role, location.pathname);
      dispatch({ type: 'SET_BREADCRUMBS', payload: breadcrumbs });
    }
  }, [location.pathname, user?.role]);

  // Navigation actions
  const navigateTo = useCallback((path: string) => {
    if (isRouteAccessible(user?.role || '', path)) {
      dispatch({ type: 'NAVIGATE_TO', payload: path });
      navigate(path);
    } else {
      console.warn(`Access denied to route: ${path}`);
    }
  }, [navigate, user?.role]);

  // Expose the navigate function directly for components that need it
  const navigateDirect = useCallback((path: string, options?: any) => {
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
    navigate(-1);
  }, [navigate]);

  const canGoBack = useCallback(() => {
    return state.navigationHistory.length > 1;
  }, [state.navigationHistory]);

  const isRouteAccessibleForUser = useCallback((path: string) => {
    return isRouteAccessible(user?.role || '', path);
  }, [user?.role]);

  const getBreadcrumbsForUser = useCallback(() => {
    return getBreadcrumbs(user?.role || '', state.currentPath);
  }, [user?.role, state.currentPath]);

  const resetNavigation = useCallback(() => {
    dispatch({ type: 'RESET_NAVIGATION' });
  }, []);

  // Specific navigation helpers
  const navigateToCase = useCallback((caseId: string) => {
    navigateTo(`/case/${caseId}`);
  }, [navigateTo]);

  const navigateToUser = useCallback((userId: string) => {
    navigateTo(`/user/${userId}`);
  }, [navigateTo]);

  const navigateToDocument = useCallback((documentId: string, caseId?: string) => {
    if (caseId) {
      navigateTo(`/document-manager/${caseId}?document=${documentId}`);
    } else {
      navigateTo(`/document-manager?document=${documentId}`);
    }
  }, [navigateTo]);

  const navigateToComplianceIssue = useCallback((issueId: string) => {
    navigateTo(`/admin/compliance-issues?issue=${issueId}`);
  }, [navigateTo]);

  const navigateToLoanApplication = useCallback((applicationId: string) => {
    navigateTo(`/admin/loan-applications?application=${applicationId}`);
  }, [navigateTo]);

  const navigateToTaskCategory = useCallback((categoryId: string) => {
    navigateTo(`/admin/task-categories?category=${categoryId}`);
  }, [navigateTo]);

  const contextValue: NavigationContextType = {
    // State
    currentPath: state.currentPath,
    previousPath: state.previousPath,
    breadcrumbs: state.breadcrumbs,
    isNavigating: state.isNavigating,
    navigationHistory: state.navigationHistory,
    
    // Actions
    navigateTo,
    navigateDirect,
    goBack,
    canGoBack,
    isRouteAccessible: isRouteAccessibleForUser,
    getBreadcrumbs: getBreadcrumbsForUser,
    resetNavigation,
    
    // Navigation helpers
    navigateToCase,
    navigateToUser,
    navigateToDocument,
    navigateToComplianceIssue,
    navigateToLoanApplication,
    navigateToTaskCategory
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// =============================================================================
// NAVIGATION HOOK
// =============================================================================

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// =============================================================================
// NAVIGATION HOOKS FOR SPECIFIC FEATURES
// =============================================================================

export function useCaseNavigation() {
  const { navigateToCase, navigateToDocument } = useNavigation();
  return { navigateToCase, navigateToDocument };
}

export function useAdminNavigation() {
  const { 
    navigateToComplianceIssue, 
    navigateToLoanApplication, 
    navigateToTaskCategory,
    navigateToUser 
  } = useNavigation();
  return { 
    navigateToComplianceIssue, 
    navigateToLoanApplication, 
    navigateToTaskCategory,
    navigateToUser 
  };
}

export function useBreadcrumbs() {
  const { breadcrumbs, getBreadcrumbs } = useNavigation();
  return { breadcrumbs, getBreadcrumbs };
}

export function useNavigationHistory() {
  const { navigationHistory, goBack, canGoBack } = useNavigation();
  return { navigationHistory, goBack, canGoBack };
}
