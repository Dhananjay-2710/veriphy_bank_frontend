import React, { useState } from 'react';
import { ArrowLeft, Users, Building, Briefcase, Settings, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  useCustomers, 
  useDepartments, 
  useEmploymentTypes, 
  useTaskTypes, 
  useTaskSlaPolicies,
  useSubProducts 
} from '../../hooks/useDashboardData';

interface CoreBusinessDataDemoProps {
  onBack: () => void;
}

export function CoreBusinessDataDemo({ onBack }: CoreBusinessDataDemoProps) {
  const [activeTab, setActiveTab] = useState('customers');

  // Fetch data using the new hooks
  const { customers, loading: customersLoading, error: customersError, refetch: refetchCustomers } = useCustomers();
  const { departments, loading: departmentsLoading, error: departmentsError, refetch: refetchDepartments } = useDepartments();
  const { employmentTypes, loading: employmentLoading, error: employmentError, refetch: refetchEmployment } = useEmploymentTypes();
  const { taskTypes, loading: taskTypesLoading, error: taskTypesError, refetch: refetchTaskTypes } = useTaskTypes();
  const { taskSlaPolicies, loading: slaLoading, error: slaError, refetch: refetchSla } = useTaskSlaPolicies();
  const { subProducts, loading: subProductsLoading, error: subProductsError, refetch: refetchSubProducts } = useSubProducts();

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'departments', label: 'Departments', icon: Building, count: departments.length },
    { id: 'employment', label: 'Employment Types', icon: Briefcase, count: employmentTypes.length },
    { id: 'tasktypes', label: 'Task Types', icon: Settings, count: taskTypes.length },
    { id: 'sla', label: 'SLA Policies', icon: Clock, count: taskSlaPolicies.length },
    { id: 'subproducts', label: 'Sub Products', icon: Settings, count: subProducts.length }
  ];

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="success" size="sm">Active</Badge> : 
      <Badge variant="error" size="sm">Inactive</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low</Badge>;
      case 'urgent':
        return <Badge variant="error" size="sm">Urgent</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const renderCustomers = () => (
    <div className="space-y-4">
      {customersLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading customers...</span>
        </div>
      ) : customersError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{customersError}</div>
          </div>
        </div>
      ) : (
        customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                    {getStatusBadge(true)}
                    <Badge variant="info" size="sm">{customer.employment}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Phone:</strong> {customer.phone}</p>
                      <p><strong>Email:</strong> {customer.email}</p>
                      <p><strong>Age:</strong> {customer.age}</p>
                    </div>
                    <div>
                      <p><strong>Risk Profile:</strong> {customer.riskProfile}</p>
                      <p><strong>KYC Status:</strong> {customer.kycStatus}</p>
                      <p><strong>Created:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-4">
      {departmentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading departments...</span>
        </div>
      ) : departmentsError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{departmentsError}</div>
          </div>
        </div>
      ) : (
        departments.map((department) => (
          <Card key={department.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                    {getStatusBadge(department.isActive)}
                    <Badge variant="info" size="sm">{department.departmentType}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{department.description}</p>
                  <div className="text-sm text-gray-500">
                    <p><strong>Code:</strong> {department.code}</p>
                    <p><strong>Users:</strong> {department.users?.length || 0}</p>
                    <p><strong>Created:</strong> {new Date(department.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderEmploymentTypes = () => (
    <div className="space-y-4">
      {employmentLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading employment types...</span>
        </div>
      ) : employmentError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{employmentError}</div>
          </div>
        </div>
      ) : (
        employmentTypes.map((employmentType) => (
          <Card key={employmentType.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{employmentType.name}</h3>
                    {getStatusBadge(employmentType.isActive)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{employmentType.description}</p>
                  <div className="text-sm text-gray-500">
                    <p><strong>Code:</strong> {employmentType.code}</p>
                    <p><strong>Created:</strong> {new Date(employmentType.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderTaskTypes = () => (
    <div className="space-y-4">
      {taskTypesLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading task types...</span>
        </div>
      ) : taskTypesError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{taskTypesError}</div>
          </div>
        </div>
      ) : (
        taskTypes.map((taskType) => (
          <Card key={taskType.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{taskType.name}</h3>
                    {getStatusBadge(taskType.isActive)}
                    <Badge variant="info" size="sm">{taskType.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{taskType.description}</p>
                  <div className="text-sm text-gray-500">
                    <p><strong>Code:</strong> {taskType.code}</p>
                    <p><strong>Created:</strong> {new Date(taskType.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderSlaPolicies = () => (
    <div className="space-y-4">
      {slaLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading SLA policies...</span>
        </div>
      ) : slaError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{slaError}</div>
          </div>
        </div>
      ) : (
        taskSlaPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{policy.name}</h3>
                    {getStatusBadge(policy.isActive)}
                    {getPriorityBadge(policy.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <p><strong>SLA Hours:</strong> {policy.slaHours}</p>
                      <p><strong>Escalation Hours:</strong> {policy.escalationHours || 'N/A'}</p>
                    </div>
                    <div>
                      <p><strong>Task Type:</strong> {policy.taskType?.name || 'N/A'}</p>
                      <p><strong>Department:</strong> {policy.department?.name || 'All'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderSubProducts = () => (
    <div className="space-y-4">
      {subProductsLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading sub products...</span>
        </div>
      ) : subProductsError ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div className="text-sm text-red-700">{subProductsError}</div>
          </div>
        </div>
      ) : (
        subProducts.map((subProduct) => (
          <Card key={subProduct.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{subProduct.name}</h3>
                    {getStatusBadge(subProduct.isActive)}
                    <Badge variant="info" size="sm">{subProduct.product?.name || 'N/A'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{subProduct.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <p><strong>Code:</strong> {subProduct.code}</p>
                      <p><strong>Interest Rate:</strong> {subProduct.interestRate}%</p>
                    </div>
                    <div>
                      <p><strong>Amount Range:</strong> ₹{subProduct.minAmount}L - ₹{subProduct.maxAmount}L</p>
                      <p><strong>Tenure:</strong> {subProduct.minTenure} - {subProduct.maxTenure} months</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const handleRefresh = () => {
    switch (activeTab) {
      case 'customers':
        refetchCustomers();
        break;
      case 'departments':
        refetchDepartments();
        break;
      case 'employment':
        refetchEmployment();
        break;
      case 'tasktypes':
        refetchTaskTypes();
        break;
      case 'sla':
        refetchSla();
        break;
      case 'subproducts':
        refetchSubProducts();
        break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return renderCustomers();
      case 'departments':
        return renderDepartments();
      case 'employment':
        return renderEmploymentTypes();
      case 'tasktypes':
        return renderTaskTypes();
      case 'sla':
        return renderSlaPolicies();
      case 'subproducts':
        return renderSubProducts();
      default:
        return renderCustomers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Core Business Data</h1>
            <p className="text-gray-600">Dynamic data from Supabase core business tables</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <Badge size="sm">{tab.count}</Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find(tab => tab.id === activeTab)?.label} 
            ({tabs.find(tab => tab.id === activeTab)?.count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
