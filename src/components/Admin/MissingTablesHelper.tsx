import React, { useState } from 'react';
import { Copy, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupabaseDatabaseService } from '../../services/supabase-database';

interface MissingTablesHelperProps {
  missingTables: string[];
  onClose: () => void;
}

export function MissingTablesHelper({ missingTables, onClose }: MissingTablesHelperProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = SupabaseDatabaseService.getMissingTableCreationScript(missingTables);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const handleDownloadScript = () => {
    const blob = new Blob([sqlScript], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'missing-tables-creation-script.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <Card className="shadow-none border-0">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <span>Create Missing Database Tables</span>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Copy the SQL script below</li>
                  <li>2. Go to your Supabase Dashboard → SQL Editor</li>
                  <li>3. Paste the script and run it</li>
                  <li>4. Refresh the Database Management page</li>
                </ol>
              </div>

              {/* Missing Tables List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Missing Tables ({missingTables.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {missingTables.map((tableName) => (
                    <div
                      key={tableName}
                      className="px-3 py-2 bg-gray-100 rounded-md text-sm font-mono"
                    >
                      {tableName}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleCopyScript}
                  className="flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadScript}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Script</span>
                </Button>
              </div>

              {/* SQL Script */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">SQL Creation Script</h3>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 font-mono">
                    {sqlScript || '-- No SQL script available for the selected tables'}
                  </pre>
                  {sqlScript && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={handleCopyScript}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Review the SQL script before running it in production</li>
                      <li>• Some tables may have dependencies on others - create them in order</li>
                      <li>• Backup your database before making structural changes</li>
                      <li>• These tables are optional for basic functionality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
