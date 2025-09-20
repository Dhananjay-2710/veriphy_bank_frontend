import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DocumentManager } from '../Documents/DocumentManager';
import { useAuth } from '../../contexts/AuthContextFixed';
import { useCases } from '../../hooks/useDashboardData';

export function DocumentManagerTest() {
  const { user } = useAuth();
  const [testCaseId, setTestCaseId] = useState<string>('');
  const [showDocumentManager, setShowDocumentManager] = useState(false);

  // Get some test cases
  const { cases } = useCases({
    assignedTo: user?.id,
    status: 'in-progress'
  });

  const handleTestDocumentManager = (caseId: string) => {
    setTestCaseId(caseId);
    setShowDocumentManager(true);
  };

  const handleBack = () => {
    setShowDocumentManager(false);
    setTestCaseId('');
  };

  if (showDocumentManager) {
    return (
      <DocumentManager
        caseId={testCaseId}
        onBack={handleBack}
        onSendMessage={(message, documentId) => {
          console.log('Test message:', message, 'Document ID:', documentId);
        }}
      />
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">🧪 Document Manager Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-blue-800">
            Test the Document Manager component with real Supabase data.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Available Cases:</h4>
            {cases.length > 0 ? (
              <div className="space-y-2">
                {cases.slice(0, 3).map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium">{case_.caseNumber}</p>
                      <p className="text-sm text-gray-600">{case_.customer.name}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTestDocumentManager(case_.id)}
                    >
                      Test Documents
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-700">No active cases found. Create a case first.</p>
            )}
          </div>

          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Test Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Real-time document loading from Supabase</li>
              <li>✅ Document approval/rejection functionality</li>
              <li>✅ Document upload with progress tracking</li>
              <li>✅ Real-time updates via Supabase subscriptions</li>
              <li>✅ WhatsApp message integration</li>
              <li>✅ Document filtering and search</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
