// =============================================================================
// TABLE OPERATIONS TESTER
// =============================================================================
// This component provides comprehensive testing for all CRUD operations

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  TestTube,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UniversalCrudService } from '../../services/universal-crud-service';
import { TableName, UserRole } from '../../types/permissions';
import { useAuth } from '../../contexts/AuthContextFixed';

// =============================================================================
// INTERFACES
// =============================================================================

interface TestResult {
  id: string;
  table: TableName;
  operation: 'create' | 'read' | 'update' | 'delete';
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
  data?: any;
  timestamp: string;
}

interface TestSuite {
  table: TableName;
  displayName: string;
  testData: any;
  updateData: any;
  tests: Array<{
    name: string;
    operation: 'create' | 'read' | 'update' | 'delete';
    description: string;
  }>;
}

// =============================================================================
// TEST SUITES
// =============================================================================

const TEST_SUITES: TestSuite[] = [
  {
    table: 'products',
    displayName: 'Products',
    testData: {
      name: 'Test Product',
      product_code: 'TEST-001',
      min_amount: 10000,
      max_amount: 100000,
      interest_rate: 12.5,
      tenure_min: 6,
      tenure_max: 36,
      status: 'active'
    },
    updateData: {
      name: 'Updated Test Product',
      interest_rate: 13.0
    },
    tests: [
      { name: 'Create Product', operation: 'create', description: 'Create a new product' },
      { name: 'Read Products', operation: 'read', description: 'Fetch all products' },
      { name: 'Update Product', operation: 'update', description: 'Update product details' },
      { name: 'Delete Product', operation: 'delete', description: 'Delete the product' }
    ]
  },
  {
    table: 'departments',
    displayName: 'Departments',
    testData: {
      name: 'Test Department',
      code: 'TEST-DEPT',
      description: 'Test department for validation',
      status: 'active'
    },
    updateData: {
      name: 'Updated Test Department',
      description: 'Updated test department description'
    },
    tests: [
      { name: 'Create Department', operation: 'create', description: 'Create a new department' },
      { name: 'Read Departments', operation: 'read', description: 'Fetch all departments' },
      { name: 'Update Department', operation: 'update', description: 'Update department details' },
      { name: 'Delete Department', operation: 'delete', description: 'Delete the department' }
    ]
  },
  {
    table: 'tasks',
    displayName: 'Tasks',
    testData: {
      title: 'Test Task',
      description: 'Test task for validation',
      priority: 'medium',
      status: 'open'
    },
    updateData: {
      title: 'Updated Test Task',
      status: 'in_progress'
    },
    tests: [
      { name: 'Create Task', operation: 'create', description: 'Create a new task' },
      { name: 'Read Tasks', operation: 'read', description: 'Fetch all tasks' },
      { name: 'Update Task', operation: 'update', description: 'Update task details' },
      { name: 'Delete Task', operation: 'delete', description: 'Delete the task' }
    ]
  },
  {
    table: 'notifications',
    displayName: 'Notifications',
    testData: {
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info'
    },
    updateData: {
      title: 'Updated Test Notification',
      message: 'This is an updated test notification'
    },
    tests: [
      { name: 'Create Notification', operation: 'create', description: 'Create a new notification' },
      { name: 'Read Notifications', operation: 'read', description: 'Fetch all notifications' },
      { name: 'Update Notification', operation: 'update', description: 'Update notification details' },
      { name: 'Delete Notification', operation: 'delete', description: 'Delete the notification' }
    ]
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TableOperationsTester() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TableName | null>(null);
  
  // =============================================================================
  // TEST EXECUTION
  // =============================================================================
  
  const runTest = async (
    suite: TestSuite,
    test: { name: string; operation: 'create' | 'read' | 'update' | 'delete'; description: string },
    createdRecordId?: string
  ): Promise<TestResult> => {
    const testId = `${suite.table}-${test.operation}-${Date.now()}`;
    const startTime = Date.now();
    
    const result: TestResult = {
      id: testId,
      table: suite.table,
      operation: test.operation,
      status: 'running',
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, result]);
    setRunningTests(prev => new Set([...prev, testId]));
    
    try {
      if (!user?.role) {
        throw new Error('User not authenticated');
      }
      
      const options = {
        userRole: user.role as UserRole,
        userId: user.id,
        organizationId: user.organizationId,
        departmentId: user.departmentId
      };
      
      let data: any = null;
      
      switch (test.operation) {
        case 'create':
          data = await UniversalCrudService.create(suite.table, suite.testData, options);
          if (data.error) throw new Error(data.error);
          break;
          
        case 'read':
          data = await UniversalCrudService.read(suite.table, options);
          if (data.error) throw new Error(data.error);
          break;
          
        case 'update':
          if (!createdRecordId) {
            throw new Error('No record ID provided for update test');
          }
          data = await UniversalCrudService.update(suite.table, createdRecordId, suite.updateData, options);
          if (data.error) throw new Error(data.error);
          break;
          
        case 'delete':
          if (!createdRecordId) {
            throw new Error('No record ID provided for delete test');
          }
          data = await UniversalCrudService.delete(suite.table, createdRecordId, options);
          if (!data.success) throw new Error(data.error || 'Delete failed');
          break;
      }
      
      const duration = Date.now() - startTime;
      
      const successResult: TestResult = {
        ...result,
        status: 'success',
        duration,
        data: data.data || data
      };
      
      setTestResults(prev => 
        prev.map(r => r.id === testId ? successResult : r)
      );
      
      return successResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult: TestResult = {
        ...result,
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setTestResults(prev => 
        prev.map(r => r.id === testId ? errorResult : r)
      );
      
      return errorResult;
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };
  
  const runTestSuite = async (suite: TestSuite) => {
    setSelectedSuite(suite.table);
    let createdRecordId: string | undefined;
    
    for (const test of suite.tests) {
      const result = await runTest(suite, test, createdRecordId);
      
      // Store the created record ID for update/delete tests
      if (test.operation === 'create' && result.status === 'success' && result.data?.id) {
        createdRecordId = result.data.id;
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setSelectedSuite(null);
  };
  
  const runAllTests = async () => {
    setIsRunningAll(true);
    
    for (const suite of TEST_SUITES) {
      await runTestSuite(suite);
      // Delay between test suites
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningAll(false);
  };
  
  const clearResults = () => {
    setTestResults([]);
  };
  
  // =============================================================================
  // STATISTICS
  // =============================================================================
  
  const getStatistics = () => {
    const total = testResults.length;
    const successful = testResults.filter(r => r.status === 'success').length;
    const failed = testResults.filter(r => r.status === 'error').length;
    const running = testResults.filter(r => r.status === 'running').length;
    const avgDuration = testResults
      .filter(r => r.duration)
      .reduce((sum, r) => sum + (r.duration || 0), 0) / testResults.filter(r => r.duration).length;
    
    return { total, successful, failed, running, avgDuration };
  };
  
  const stats = getStatistics();
  
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status}
      </Badge>
    );
  };
  
  // =============================================================================
  // RENDER
  // =============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Operations Tester</h1>
          <p className="text-gray-600">Test CRUD operations across all tables</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunningAll ? 'Running All Tests...' : 'Run All Tests'}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TestTube className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{stats.avgDuration ? `${stats.avgDuration.toFixed(0)}ms` : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Test Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEST_SUITES.map(suite => (
          <Card
            key={suite.table}
            className={`cursor-pointer transition-all ${
              selectedSuite === suite.table 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => runTestSuite(suite)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{suite.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {suite.tests.length} tests
                </p>
                <div className="flex flex-wrap gap-1">
                  {suite.tests.map((test, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {test.operation}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">
                        {result.table} - {result.operation}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(result.status)}
                    {result.duration && (
                      <span className="text-sm text-gray-600">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
