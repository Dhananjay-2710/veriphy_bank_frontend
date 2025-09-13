import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, ArrowLeft, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface WorkloadPlannerProps {
  onBack: () => void;
}

export function WorkloadPlanner({ onBack }: WorkloadPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const tasks = [
    {
      id: '1',
      time: '09:00',
      customer: 'Ramesh Gupta',
      phone: '+91-9876543210',
      task: 'Follow up on GST documents',
      priority: 'high',
      type: 'follow-up'
    },
    {
      id: '2',
      time: '10:30',
      customer: 'Amit Verma',
      phone: '+91-9876543211',
      task: 'Initial document collection',
      priority: 'medium',
      type: 'collection'
    },
    {
      id: '3',
      time: '14:00',
      customer: 'Neha Singh',
      phone: '+91-9876543212',
      task: 'Document verification review',
      priority: 'low',
      type: 'review'
    },
    {
      id: '4',
      time: '16:00',
      customer: 'Pradeep Kumar',
      phone: '+91-9876543213',
      task: 'Loan approval discussion',
      priority: 'high',
      type: 'discussion'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="error" size="sm">High</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      case 'low':
        return <Badge variant="success" size="sm">Low</Badge>;
      default:
        return <Badge size="sm">{priority}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'follow-up':
        return 'border-l-yellow-500';
      case 'collection':
        return 'border-l-blue-500';
      case 'review':
        return 'border-l-green-500';
      case 'discussion':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-500';
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
            <h1 className="text-2xl font-bold text-gray-900">Workload Planner</h1>
            <p className="text-gray-600">Schedule and manage your daily tasks</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">High Priority</span>
                <span className="font-medium text-red-600">
                  {tasks.filter(t => t.priority === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated Time</span>
                <span className="font-medium">6.5 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedDate).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`border-l-4 pl-4 py-3 rounded-r-lg bg-white border border-gray-200 hover:shadow-md transition-shadow ${getTypeColor(task.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{task.time}</span>
                          </div>
                          {getPriorityBadge(task.priority)}
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1">{task.task}</h3>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{task.customer}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{task.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Call</Button>
                        <Button variant="outline" size="sm">WhatsApp</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-sm text-gray-600">Tasks Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-sm text-gray-600">On-time Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-600">2.1</div>
            <p className="text-sm text-gray-600">Avg. Hours per Case</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}