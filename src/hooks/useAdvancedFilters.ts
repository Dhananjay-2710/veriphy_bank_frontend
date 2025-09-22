// =============================================================================
// ADVANCED FILTERING HOOK - Multi-criteria Filtering System
// =============================================================================

import { useState, useCallback, useMemo } from 'react';

// =============================================================================
// FILTER INTERFACES
// =============================================================================

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equal' 
  | 'less_than_or_equal' 
  | 'in' 
  | 'not_in' 
  | 'is_null' 
  | 'is_not_null' 
  | 'between' 
  | 'date_between'
  | 'regex';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface FilterGroup {
  id: string;
  conditions: FilterCondition[];
  operator: 'AND' | 'OR';
  label?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: FilterGroup[];
  isDefault?: boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'range';
  options?: Array<{ value: any; label: string }>;
  operators?: FilterOperator[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AdvancedFiltersState {
  groups: FilterGroup[];
  presets: FilterPreset[];
  activePreset?: string;
  isOpen: boolean;
  searchTerm: string;
}

// =============================================================================
// ADVANCED FILTERS HOOK
// =============================================================================

export function useAdvancedFilters(
  fields: FilterField[],
  initialPresets: FilterPreset[] = []
) {
  const [state, setState] = useState<AdvancedFiltersState>({
    groups: [],
    presets: initialPresets,
    isOpen: false,
    searchTerm: ''
  });

  // Add filter group
  const addFilterGroup = useCallback((operator: 'AND' | 'OR' = 'AND') => {
    const newGroup: FilterGroup = {
      id: `group_${Date.now()}`,
      conditions: [],
      operator
    };
    
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup]
    }));
  }, []);

  // Remove filter group
  const removeFilterGroup = useCallback((groupId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(group => group.id !== groupId)
    }));
  }, []);

  // Add condition to group
  const addCondition = useCallback((groupId: string, field: string) => {
    const fieldConfig = fields.find(f => f.key === field);
    if (!fieldConfig) return;

    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      field,
      operator: fieldConfig.operators?.[0] || 'equals',
      value: fieldConfig.type === 'boolean' ? false : '',
      label: fieldConfig.label
    };

    setState(prev => ({
      ...prev,
      groups: prev.groups.map(group =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    }));
  }, [fields]);

  // Update condition
  const updateCondition = useCallback((
    groupId: string, 
    conditionId: string, 
    updates: Partial<FilterCondition>
  ) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map(condition =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition
              )
            }
          : group
      )
    }));
  }, []);

  // Remove condition
  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(group =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter(condition => condition.id !== conditionId)
            }
          : group
      )
    }));
  }, []);

  // Update group operator
  const updateGroupOperator = useCallback((groupId: string, operator: 'AND' | 'OR') => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(group =>
        group.id === groupId ? { ...group, operator } : group
      )
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      groups: [],
      activePreset: undefined
    }));
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = state.presets.find(p => p.id === presetId);
    if (preset) {
      setState(prev => ({
        ...prev,
        groups: preset.filters,
        activePreset: presetId
      }));
    }
  }, [state.presets]);

  // Save current filters as preset
  const saveAsPreset = useCallback((name: string, description: string) => {
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      description,
      filters: state.groups
    };

    setState(prev => ({
      ...prev,
      presets: [...prev.presets, newPreset]
    }));
  }, [state.groups]);

  // Toggle filters panel
  const toggleFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, []);

  // Update search term
  const updateSearchTerm = useCallback((searchTerm: string) => {
    setState(prev => ({
      ...prev,
      searchTerm
    }));
  }, []);

  // Get available operators for field
  const getFieldOperators = useCallback((fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return [];

    const defaultOperators: FilterOperator[] = ['equals', 'not_equals'];
    
    switch (field.type) {
      case 'text':
        return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex'];
      case 'number':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between'];
      case 'date':
        return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'date_between'];
      case 'select':
      case 'multiselect':
        return ['equals', 'not_equals', 'in', 'not_in'];
      case 'boolean':
        return ['equals', 'not_equals'];
      case 'range':
        return ['between', 'greater_than', 'less_than'];
      default:
        return field.operators || defaultOperators;
    }
  }, [fields]);

  // Convert filters to Supabase query
  const getSupabaseQuery = useCallback(() => {
    if (state.groups.length === 0) return {};

    const buildConditionQuery = (condition: FilterCondition) => {
      const { field, operator, value } = condition;
      
      switch (operator) {
        case 'equals':
          return { [field]: { eq: value } };
        case 'not_equals':
          return { [field]: { neq: value } };
        case 'contains':
          return { [field]: { ilike: `%${value}%` } };
        case 'not_contains':
          return { [field]: { not: { ilike: `%${value}%` } } };
        case 'starts_with':
          return { [field]: { ilike: `${value}%` } };
        case 'ends_with':
          return { [field]: { ilike: `%${value}` } };
        case 'greater_than':
          return { [field]: { gt: value } };
        case 'less_than':
          return { [field]: { lt: value } };
        case 'greater_than_or_equal':
          return { [field]: { gte: value } };
        case 'less_than_or_equal':
          return { [field]: { lte: value } };
        case 'in':
          return { [field]: { in: Array.isArray(value) ? value : [value] } };
        case 'not_in':
          return { [field]: { not: { in: Array.isArray(value) ? value : [value] } } };
        case 'is_null':
          return { [field]: { is: null } };
        case 'is_not_null':
          return { [field]: { not: { is: null } } };
        case 'between':
          return { [field]: { gte: value[0], lte: value[1] } };
        case 'date_between':
          return { [field]: { gte: value[0], lte: value[1] } };
        default:
          return {};
      }
    };

    const buildGroupQuery = (group: FilterGroup) => {
      if (group.conditions.length === 0) return {};
      
      const conditionQueries = group.conditions.map(buildConditionQuery);
      
      if (group.operator === 'OR') {
        return { or: conditionQueries };
      } else {
        return { and: conditionQueries };
      }
    };

    const groupQueries = state.groups.map(buildGroupQuery);
    
    if (groupQueries.length === 1) {
      return groupQueries[0];
    } else {
      return { and: groupQueries };
    }
  }, [state.groups]);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const totalConditions = state.groups.reduce((sum, group) => sum + group.conditions.length, 0);
    
    if (totalConditions === 0) {
      return 'No filters applied';
    }
    
    const groupCount = state.groups.length;
    const conditionCount = totalConditions;
    
    return `${groupCount} filter group${groupCount > 1 ? 's' : ''}, ${conditionCount} condition${conditionCount > 1 ? 's' : ''}`;
  }, [state.groups]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return state.groups.some(group => group.conditions.length > 0);
  }, [state.groups]);

  // Get available fields for search
  const searchableFields = useMemo(() => {
    return fields.filter(field => 
      field.type === 'text' || 
      field.type === 'select' || 
      field.type === 'multiselect'
    );
  }, [fields]);

  return {
    // State
    groups: state.groups,
    presets: state.presets,
    activePreset: state.activePreset,
    isOpen: state.isOpen,
    searchTerm: state.searchTerm,
    hasActiveFilters,

    // Actions
    addFilterGroup,
    removeFilterGroup,
    addCondition,
    updateCondition,
    removeCondition,
    updateGroupOperator,
    clearFilters,
    applyPreset,
    saveAsPreset,
    toggleFilters,
    updateSearchTerm,

    // Utilities
    getFieldOperators,
    getSupabaseQuery,
    getFilterSummary,
    searchableFields,

    // Field configuration
    fields
  };
}

// =============================================================================
// FILTER PRESETS
// =============================================================================

export const COMMON_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'recent_cases',
    name: 'Recent Cases',
    description: 'Cases created in the last 7 days',
    filters: [{
      id: 'recent_group',
      operator: 'AND',
      conditions: [{
        id: 'recent_condition',
        field: 'created_at',
        operator: 'greater_than',
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }]
    }]
  },
  {
    id: 'high_priority',
    name: 'High Priority',
    description: 'High priority cases',
    filters: [{
      id: 'priority_group',
      operator: 'AND',
      conditions: [{
        id: 'priority_condition',
        field: 'priority',
        operator: 'equals',
        value: 'high'
      }]
    }]
  },
  {
    id: 'pending_approval',
    name: 'Pending Approval',
    description: 'Cases pending approval',
    filters: [{
      id: 'status_group',
      operator: 'AND',
      conditions: [{
        id: 'status_condition',
        field: 'status',
        operator: 'in',
        value: ['review', 'pending_approval']
      }]
    }]
  }
];

// =============================================================================
// FILTER FIELD CONFIGURATIONS
// =============================================================================

export const CASE_FILTER_FIELDS: FilterField[] = [
  {
    key: 'caseNumber',
    label: 'Case Number',
    type: 'text',
    operators: ['equals', 'contains', 'starts_with'],
    placeholder: 'Enter case number'
  },
  {
    key: 'customer_name',
    label: 'Customer Name',
    type: 'text',
    operators: ['contains', 'starts_with', 'ends_with'],
    placeholder: 'Enter customer name'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { value: 'new', label: 'New' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ]
  },
  {
    key: 'loan_amount',
    label: 'Loan Amount',
    type: 'number',
    operators: ['equals', 'greater_than', 'less_than', 'between'],
    validation: { min: 0 }
  },
  {
    key: 'created_at',
    label: 'Created Date',
    type: 'date',
    operators: ['equals', 'greater_than', 'less_than', 'date_between']
  },
  {
    key: 'assigned_to',
    label: 'Assigned To',
    type: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  }
];

export const DOCUMENT_FILTER_FIELDS: FilterField[] = [
  {
    key: 'name',
    label: 'Document Name',
    type: 'text',
    operators: ['contains', 'starts_with', 'ends_with'],
    placeholder: 'Enter document name'
  },
  {
    key: 'type',
    label: 'Document Type',
    type: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in']
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'expired', label: 'Expired' }
    ]
  },
  {
    key: 'uploaded_at',
    label: 'Upload Date',
    type: 'date',
    operators: ['equals', 'greater_than', 'less_than', 'date_between']
  },
  {
    key: 'file_size',
    label: 'File Size',
    type: 'number',
    operators: ['greater_than', 'less_than', 'between'],
    validation: { min: 0 }
  }
];
