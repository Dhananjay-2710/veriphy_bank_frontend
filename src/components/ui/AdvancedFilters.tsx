// =============================================================================
// ADVANCED FILTERS COMPONENT - Multi-criteria Filtering UI
// =============================================================================

import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp,
  Save,
  Trash2
} from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { FilterField, FilterGroup, FilterCondition, FilterPreset } from '../../hooks/useAdvancedFilters';

// =============================================================================
// ADVANCED FILTERS INTERFACES
// =============================================================================

interface AdvancedFiltersProps {
  fields: FilterField[];
  groups: FilterGroup[];
  presets: FilterPreset[];
  activePreset?: string;
  isOpen: boolean;
  hasActiveFilters: boolean;
  onToggle: () => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onAddCondition: (groupId: string, field: string) => void;
  onUpdateCondition: (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onUpdateGroupOperator: (groupId: string, operator: 'AND' | 'OR') => void;
  onClearFilters: () => void;
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string, description: string) => void;
  getFieldOperators: (fieldKey: string) => string[];
  getFilterSummary: () => string;
  className?: string;
}

// =============================================================================
// ADVANCED FILTERS COMPONENT
// =============================================================================

export function AdvancedFilters({
  fields,
  groups,
  presets,
  activePreset,
  isOpen,
  hasActiveFilters,
  onToggle,
  onAddGroup,
  onRemoveGroup,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onUpdateGroupOperator,
  onClearFilters,
  onApplyPreset,
  onSavePreset,
  getFieldOperators,
  getFilterSummary,
  className = ''
}: AdvancedFiltersProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), presetDescription.trim());
      setPresetName('');
      setPresetDescription('');
      setShowSavePreset(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <Badge variant="default" className="ml-2">
              {groups.reduce((sum, group) => sum + group.conditions.length, 0)}
            </Badge>
          )}
        </Button>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresets(!showPresets)}
            >
              Presets
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>

            {showPresets && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Filter Presets</h4>
                </div>
                <div className="py-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onApplyPreset(preset.id);
                        setShowPresets(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        activePreset === preset.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-gray-500">{preset.description}</div>
                      </div>
                      {preset.isDefault && (
                        <Badge variant="default" size="sm">Default</Badge>
                      )}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSavePreset(true);
                      setShowPresets(false);
                    }}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Current Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          {getFilterSummary()}
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filter Conditions</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddGroup}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Group
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No filters applied</p>
                <p className="text-sm">Add a filter group to get started</p>
              </div>
            ) : (
              groups.map((group, groupIndex) => (
                <FilterGroup
                  key={group.id}
                  group={group}
                  groupIndex={groupIndex}
                  fields={fields}
                  getFieldOperators={getFieldOperators}
                  onRemoveGroup={onRemoveGroup}
                  onAddCondition={onAddCondition}
                  onUpdateCondition={onUpdateCondition}
                  onRemoveCondition={onRemoveCondition}
                  onUpdateGroupOperator={onUpdateGroupOperator}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter preset name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSavePreset(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                Save Preset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FILTER GROUP COMPONENT
// =============================================================================

interface FilterGroupProps {
  group: FilterGroup;
  groupIndex: number;
  fields: FilterField[];
  getFieldOperators: (fieldKey: string) => string[];
  onRemoveGroup: (groupId: string) => void;
  onAddCondition: (groupId: string, field: string) => void;
  onUpdateCondition: (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onUpdateGroupOperator: (groupId: string, operator: 'AND' | 'OR') => void;
}

function FilterGroup({
  group,
  groupIndex,
  fields,
  getFieldOperators,
  onRemoveGroup,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onUpdateGroupOperator
}: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium text-gray-900">
            Group {groupIndex + 1}
          </span>
          <select
            value={group.operator}
            onChange={(e) => onUpdateGroupOperator(group.id, e.target.value as 'AND' | 'OR')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveGroup(group.id)}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {group.conditions.map((condition, conditionIndex) => (
            <FilterCondition
              key={condition.id}
              condition={condition}
              conditionIndex={conditionIndex}
              fields={fields}
              getFieldOperators={getFieldOperators}
              onUpdate={(updates) => onUpdateCondition(group.id, condition.id, updates)}
              onRemove={() => onRemoveCondition(group.id, condition.id)}
            />
          ))}

          <div className="pt-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onAddCondition(group.id, e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-sm border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">Add condition...</option>
              {fields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FILTER CONDITION COMPONENT
// =============================================================================

interface FilterConditionProps {
  condition: FilterCondition;
  conditionIndex: number;
  fields: FilterField[];
  getFieldOperators: (fieldKey: string) => string[];
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

function FilterCondition({
  condition,
  conditionIndex,
  fields,
  getFieldOperators,
  onUpdate,
  onRemove
}: FilterConditionProps) {
  const field = fields.find(f => f.key === condition.field);
  const operators = getFieldOperators(condition.field);

  const renderValueInput = () => {
    if (!field) return null;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder={field.placeholder || 'Enter value'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Enter number"
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select value</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <select
            value={condition.value ? 'true' : 'false'}
            onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Enter value"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
      <span className="text-sm text-gray-500 w-8">
        {conditionIndex + 1}
      </span>

      <select
        value={condition.field}
        onChange={(e) => onUpdate({ field: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {fields.map((field) => (
          <option key={field.key} value={field.key}>
            {field.label}
          </option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as any })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {operators.map((operator) => (
          <option key={operator} value={operator}>
            {operator.replace(/_/g, ' ').toUpperCase()}
          </option>
        ))}
      </select>

      <div className="flex-1">
        {renderValueInput()}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
