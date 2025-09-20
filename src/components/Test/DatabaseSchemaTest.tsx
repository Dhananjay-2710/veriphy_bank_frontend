import React, { useState } from 'react';
import { supabase } from '../../supabase-client';

export function DatabaseSchemaTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabaseSchema = async () => {
    setLoading(true);
    setResult('Testing database schema...\n');

    try {
      // Test 1: Check what tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) {
        setResult(prev => prev + `Error getting tables: ${tablesError.message}\n`);
      } else {
        setResult(prev => prev + `Tables found: ${tables?.map(t => t.table_name).join(', ')}\n\n`);
      }

      // Test 2: Check users table structure
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        setResult(prev => prev + `Error getting users: ${usersError.message}\n`);
      } else {
        setResult(prev => prev + `Users table structure: ${JSON.stringify(users, null, 2)}\n\n`);
      }

      // Test 3: Check cases table structure
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .limit(1);

      if (casesError) {
        setResult(prev => prev + `Error getting cases: ${casesError.message}\n`);
      } else {
        setResult(prev => prev + `Cases table structure: ${JSON.stringify(cases, null, 2)}\n\n`);
      }

      // Test 4: Check documents table structure
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .limit(1);

      if (documentsError) {
        setResult(prev => prev + `Error getting documents: ${documentsError.message}\n`);
      } else {
        setResult(prev => prev + `Documents table structure: ${JSON.stringify(documents, null, 2)}\n\n`);
      }

    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Database Schema Test</h3>
      <button
        onClick={testDatabaseSchema}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Schema'}
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </div>
  );
}
