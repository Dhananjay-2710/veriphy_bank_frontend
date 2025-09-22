// =============================================================================
// BULK OPERATIONS COMPONENT - Advanced Bulk Data Management UI
// =============================================================================

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  MoreHorizontal, 
  AlertTriangle,
  Loader
} from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

// =============================================================================
// BULK OPERATIONS INTERFACES
// =============================================================================

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  icon?: React.ComponentType<any>;
  isDestructive?: boolean;
  isDisabled?: boolean;
}

interface BulkOperationsProps {
  selectedCount: number;
  totalCount: number;
  operations: BulkOperation[];
  onOperationClick: (operationId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isProcessing?: boolean;
  className?: string;
}

// =============================================================================
// BULK OPERATIONS COMPONENT
// =============================================================================

export function BulkOperations({
  selectedCount,
  totalCount,
  operations,
  onOperationClick,
  onSelectAll,
  onDeselectAll,
  onClearSelection,
  isAllSelected,
  isPartiallySelected,
  isProcessing = false,
  className = ''
}: BulkOperationsProps) {
  const [showOperations, setShowOperations] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Selection info and controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isProcessing}
                className="flex items-center space-x-1"
              >
                {isAllSelected ? (
                  <Check className="h-4 w-4" />
                ) : isPartiallySelected ? (
                  <div className="h-4 w-4 border-2 border-blue-600 rounded" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-400 rounded" />
                )}
                <span>
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isProcessing}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-700">
              <span className="font-medium">{selectedCount}</span> of{' '}
              <span className="font-medium">{totalCount}</span> selected
            </div>
          </div>

          {/* Operations */}
          <div className="flex items-center space-x-2">
            {operations.slice(0, 3).map((operation) => {
              const Icon = operation.icon || MoreHorizontal;
              
              return (
                <Button
                  key={operation.id}
                  variant={operation.isDestructive ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onOperationClick(operation.id)}
                  disabled={isProcessing || operation.isDisabled}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{operation.name}</span>
                </Button>
              );
            })}

            {operations.length > 3 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOperations(!showOperations)}
                  disabled={isProcessing}
                  className="flex items-center space-x-1"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>More</span>
                </Button>

                {showOperations && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {operations.slice(3).map((operation) => {
                        const Icon = operation.icon || MoreHorizontal;
                        
                        return (
                          <button
                            key={operation.id}
                            onClick={() => {
                              onOperationClick(operation.id);
                              setShowOperations(false);
                            }}
                            disabled={isProcessing || operation.isDisabled}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                              operation.isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{operation.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// BULK OPERATIONS CONFIRMATION MODAL
// =============================================================================

interface BulkOperationsConfirmationProps {
  isOpen: boolean;
  operation: BulkOperation | null;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function BulkOperationsConfirmation({
  isOpen,
  operation,
  selectedCount,
  onConfirm,
  onCancel,
  isProcessing = false
}: BulkOperationsConfirmationProps) {
  if (!isOpen || !operation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          {operation.isDestructive ? (
            <AlertTriangle className="h-6 w-6 text-red-600" />
          ) : (
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-blue-600" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm {operation.name}
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          {operation.description} for <span className="font-medium">{selectedCount}</span> selected items.
        </p>

        {operation.isDestructive && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 font-medium">
                This action cannot be undone
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={operation.isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center space-x-2"
          >
            {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
            <span>{isProcessing ? 'Processing...' : 'Confirm'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BULK OPERATIONS PROGRESS
// =============================================================================

interface BulkOperationsProgressProps {
  isVisible: boolean;
  processedCount: number;
  totalCount: number;
  currentOperation?: string;
  className?: string;
}

export function BulkOperationsProgress({
  isVisible,
  processedCount,
  totalCount,
  currentOperation,
  className = ''
}: BulkOperationsProgressProps) {
  if (!isVisible) return null;

  const percentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {currentOperation || 'Processing...'}
        </span>
        <span className="text-sm text-gray-500">
          {processedCount} of {totalCount}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// BULK OPERATIONS RESULT
// =============================================================================

interface BulkOperationsResultProps {
  result: {
    success: boolean;
    message: string;
    processedCount: number;
    failedCount: number;
    errors?: string[];
  } | null;
  onDismiss: () => void;
  className?: string;
}

export function BulkOperationsResult({
  result,
  onDismiss,
  className = ''
}: BulkOperationsResultProps) {
  if (!result) return null;

  return (
    <div className={`bg-white border rounded-md p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
          result.success ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {result.success ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? 'Operation Completed' : 'Operation Failed'}
          </h4>
          
          <p className="text-sm text-gray-600 mt-1">
            {result.message}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={result.success ? "success" : "error"}>
              {result.processedCount} processed
            </Badge>
            {result.failedCount > 0 && (
              <Badge variant="error">
                {result.failedCount} failed
              </Badge>
            )}
          </div>
          
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  View errors ({result.errors.length})
                </summary>
                <ul className="mt-2 space-y-1 text-red-600">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-xs">• {error}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
