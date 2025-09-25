// =============================================================================
// BREADCRUMBS COMPONENT - Navigation Breadcrumb Trail
// =============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs } from '../../contexts/NavigationContext';

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
  customBreadcrumbs?: Array<{
    label: string;
    path: string;
    icon?: any;
  }>;
}

export function Breadcrumbs({ 
  className = '', 
  showHome = true,
  customBreadcrumbs 
}: BreadcrumbsProps) {
  const { breadcrumbs } = useBreadcrumbs();
  
  const displayBreadcrumbs = customBreadcrumbs || breadcrumbs;

  if (displayBreadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if only home
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}>
      {displayBreadcrumbs.map((breadcrumb, index) => {
        const isLast = index === displayBreadcrumbs.length - 1;
        const Icon = breadcrumb.icon;
        
        return (
          <React.Fragment key={`breadcrumb-${index}-${breadcrumb.path}`}>
            {index === 0 && showHome ? (
              <Link
                to={breadcrumb.path}
                className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1">
                {Icon && <Icon className="h-4 w-4" />}
                {isLast ? (
                  <span className="text-gray-900 font-medium">
                    {breadcrumb.label}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.path}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )}
              </div>
            )}
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// =============================================================================
// BREADCRUMB UTILITIES
// =============================================================================

export function createBreadcrumbsFromPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  let currentPath = '';
  
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // Map segment to readable label
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: currentPath
    });
  });
  
  return breadcrumbs;
}

// =============================================================================
// BREADCRUMB HOOKS
// =============================================================================

export function useBreadcrumbNavigation() {
  const { breadcrumbs, navigateTo } = useBreadcrumbs();
  
  const navigateToBreadcrumb = (index: number) => {
    if (index >= 0 && index < breadcrumbs.length) {
      navigateTo(breadcrumbs[index].path);
    }
  };
  
  const canNavigateToBreadcrumb = (index: number) => {
    return index >= 0 && index < breadcrumbs.length - 1;
  };
  
  return {
    breadcrumbs,
    navigateToBreadcrumb,
    canNavigateToBreadcrumb
  };
}
