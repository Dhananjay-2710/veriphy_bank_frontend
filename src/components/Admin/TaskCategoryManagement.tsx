import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Palette,
  Tag,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useTaskCategories } from '../../hooks/useDashboardData';
import { SupabaseDatabaseService } from '../../services/supabase-database';
import { TaskCategory } from '../../types';

interface TaskCategoryManagementProps {
  onNavigateToTaskCategory?: (categoryId: string) => void;
  onEditTaskCategory?: (categoryId: string) => void;
}

export function TaskCategoryManagement({ 
  onNavigateToTaskCategory,
  onEditTaskCategory
}: TaskCategoryManagementProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    isActive?: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'tag',
    isActive: true
  });
  const { user } = useAuth();
  
  // Get real data from Supabase
  const { taskCategories, loading, error, refetch } = useTaskCategories({
    ...selectedFilters,
    searchTerm: searchTerm || undefined
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await SupabaseDatabaseService.updateTaskCategory(editingCategory.id, formData);
        setEditingCategory(null);
      } else {
        await SupabaseDatabaseService.createTaskCategory(formData);
      }
      setFormData({ name: '', description: '', color: '#3B82F6', icon: 'tag', isActive: true });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Failed to save task category');
    }
  };

  // Handle actions
  const handleViewCategory = (categoryId: string) => {
    if (onNavigateToTaskCategory) {
      onNavigateToTaskCategory(categoryId);
    }
  };

  const handleEditCategory = (category: TaskCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    setShowCreateForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this task category?')) {
      try {
        await SupabaseDatabaseService.deleteTaskCategory(categoryId);
        refetch(); // Refresh data
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete task category');
      }
    }
  };

  const handleToggleActive = async (categoryId: string, isActive: boolean) => {
    try {
      await SupabaseDatabaseService.updateTaskCategory(categoryId, { isActive });
      refetch(); // Refresh data
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Failed to update task category');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
        {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Task Categories</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Category Management</h1>
          <p className="text-gray-600">Manage task categories and their properties</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', color: '#3B82F6', icon: 'tag', isActive: true });
            setShowCreateForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedFilters.isActive === undefined ? '' : selectedFilters.isActive.toString()}
                onChange={(e) => setSelectedFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedFilters({});
                  setSearchTerm('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? 'Edit Task Category' : 'Create New Task Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter icon name (e.g., tag, folder, file)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', color: '#3B82F6', icon: 'tag', isActive: true });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taskCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    {getStatusBadge(category.isActive)}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCategory(category.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(category.id, !category.isActive)}
                    className={category.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {category.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span>Color: {category.color}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>Icon: {category.icon}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {taskCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No task categories found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search terms or filters
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
