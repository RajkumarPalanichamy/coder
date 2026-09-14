'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { downloadStudentImportTemplate, exportBulkImportReport } from '../../lib/excelExport';
import { BATCH_SIZE, chunkArray, parseStudentWorkbook } from '../../lib/studentBulkImport';

const STAGES = {
  SELECT: 'select',
  IMPORTING: 'importing',
  DONE: 'done',
};

export default function BulkImportStudentsModal({ onClose, onImported }) {
  const [stage, setStage] = useState(STAGES.SELECT);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parseSkipped, setParseSkipped] = useState([]);
  const [parseError, setParseError] = useState('');
  const [parsing, setParsing] = useState(false);

  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState({ inserted: 0, duplicates: [], invalidRows: [] });
  const [failedBatches, setFailedBatches] = useState([]);

  const cancelRef = useRef(false);
  const fileInputRef = useRef(null);

  const resetFile = () => {
    setFileName('');
    setParsedRows([]);
    setParseSkipped([]);
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError('');
    setParsedRows([]);
    setParseSkipped([]);
    setFileName(file.name);

    try {
      // Yield a tick so the "Parsing..." state actually paints before the
      // (synchronous, and for large files slow) parse work runs.
      await new Promise((resolve) => setTimeout(resolve, 30));
      const buffer = await file.arrayBuffer();
      const { rows, skipped } = parseStudentWorkbook(buffer);
      if (rows.length === 0) {
        setParseError('No valid student rows were found in this file.');
      }
      setParsedRows(rows);
      setParseSkipped(skipped);
    } catch (err) {
      setParseError(err.message || 'Could not read this file.');
    } finally {
      setParsing(false);
    }
  };

  const runImport = async (rowsToSend) => {
    cancelRef.current = false;
    setStage(STAGES.IMPORTING);

    const batches = chunkArray(rowsToSend, BATCH_SIZE);
    setProgress({ done: 0, total: rowsToSend.length });

    let inserted = 0;
    const duplicates = [];
    const invalidRows = [];
    const stillFailing = [];

    for (let i = 0; i < batches.length; i++) {
      if (cancelRef.current) break;
      const batch = batches[i];
      try {
        const res = await fetch('/api/admin/students/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ students: batch, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Batch failed');

        inserted += data.insertedCount || 0;
        duplicates.push(...(data.duplicates || []));
        invalidRows.push(...(data.invalidRows || []));
      } catch (err) {
        stillFailing.push({ batchIndex: i, rows: batch, errorMessage: err.message });
      }
      setProgress({ done: Math.min((i + 1) * BATCH_SIZE, rowsToSend.length), total: rowsToSend.length });
    }

    setSummary((prev) => ({
      inserted: prev.inserted + inserted,
      duplicates: [...prev.duplicates, ...duplicates],
      invalidRows: [...prev.invalidRows, ...invalidRows],
    }));
    setFailedBatches(stillFailing);
    setStage(STAGES.DONE);
  };

  const handleStartImport = () => {
    setSummary({ inserted: 0, duplicates: [], invalidRows: [] });
    setFailedBatches([]);
    runImport(parsedRows);
  };

  const handleRetryFailed = () => {
    const retryRows = failedBatches.flatMap((b) => b.rows);
    setFailedBatches([]);
    runImport(retryRows);
  };

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const handleDownloadReport = () => {
    const rows = [
      ...parseSkipped,
      ...summary.duplicates.map((d) => ({ Row: '', Email: d.email, Reason: d.reason })),
      ...summary.invalidRows.map((d) => ({ Row: '', Email: d.email, Reason: d.reason })),
    ];
    exportBulkImportReport(rows, `bulk_import_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFinish = () => {
    if (summary.inserted > 0) onImported?.();
    onClose();
  };

  const totalIssues = parseSkipped.length + summary.duplicates.length + summary.invalidRows.length;
  const canStart = parsedRows.length > 0 && password.length >= 6 && !parsing;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Bulk Import Students</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {stage === STAGES.SELECT && (
          <div className="p-6 space-y-5">
            <button
              type="button"
              onClick={() => downloadStudentImportTemplate()}
              className="w-full flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50"
            >
              <Download className="h-4 w-4" /> Download Template Sheet
            </button>

            <div>
              <label htmlFor="bulkPassword" className="block text-sm font-medium text-gray-700">
                Temporary password for this batch
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="bulkPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Applied to every student in this file"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Every student created from this file will get this password. They can change it later from
                their profile.
              </p>
            </div>

            <div>
              <label htmlFor="bulkFile" className="block text-sm font-medium text-gray-700 mb-1">
                Student sheet (.xlsx, .xls or .csv)
              </label>
              <input
                id="bulkFile"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {parsing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Reading {fileName}...
              </div>
            )}

            {parseError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {parseError}
              </div>
            )}

            {!parsing && parsedRows.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded p-3 text-sm text-gray-700 space-y-1">
                <div className="flex items-center gap-2 font-medium text-indigo-700">
                  <FileSpreadsheet className="h-4 w-4" /> {fileName}
                </div>
                <p>
                  <strong>{parsedRows.length}</strong> student{parsedRows.length === 1 ? '' : 's'} ready to
                  import
                  {parseSkipped.length > 0 && (
                    <span className="text-amber-700">
                      {' '}
                      · <strong>{parseSkipped.length}</strong> row{parseSkipped.length === 1 ? '' : 's'} skipped
                    </span>
                  )}
                </p>
                {parsedRows.length > BATCH_SIZE && (
                  <p className="text-xs text-gray-500">
                    Uploads run in batches of {BATCH_SIZE} - keep this tab open until it finishes.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartImport}
                disabled={!canStart}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Start Import
              </button>
            </div>
          </div>
        )}

        {stage === STAGES.IMPORTING && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              Importing students... ({progress.done} / {progress.total})
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">Keep this tab open - closing it will stop the import.</p>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel Import
            </button>
          </div>
        )}

        {stage === STAGES.DONE && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-4 py-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>
                <strong>{summary.inserted}</strong> student{summary.inserted === 1 ? '' : 's'} created
                successfully.
              </span>
            </div>

            {totalIssues > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded px-4 py-3 text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" /> {totalIssues} row{totalIssues === 1 ? '' : 's'} skipped
                </div>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  {parseSkipped.length > 0 && <li>{parseSkipped.length} invalid in the file itself</li>}
                  {summary.duplicates.length > 0 && (
                    <li>{summary.duplicates.length} already existed as a student</li>
                  )}
                  {summary.invalidRows.length > 0 && <li>{summary.invalidRows.length} rejected by the server</li>}
                </ul>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="mt-2 text-indigo-700 underline text-xs"
                >
                  Download skipped rows report
                </button>
              </div>
            )}

            {failedBatches.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {failedBatches.reduce((n, b) => n + b.rows.length, 0)} students could not be sent (network or
                  server error)
                </div>
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="text-indigo-700 underline text-xs"
                >
                  Retry failed batches
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
