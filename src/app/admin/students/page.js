"use client";
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Edit, Trash2, UserPlus, Download, Upload, FileText } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function AdminStudentsPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      setStudents(students.filter((s) => s._id !== id));
    } catch {
      alert("Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = selectedStudents.size > 0 
      ? students.filter(student => selectedStudents.has(student._id))
      : students;

    const excelData = dataToExport.map(student => ({
      'Name': `${student.firstName} ${student.lastName}`,
      'Email': student.email,
      'Username': student.username,
      'Phone Number': student.phoneNumber || '',
      'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
      'Gender': student.gender || '',
      'About': student.about || '',
      'Status': student.isActive ? 'Active' : 'Inactive',
      'Created At': new Date(student.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Auto-adjust column widths
    const colWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const studentsToImport = jsonData.map(row => ({
        firstName: row['First Name'] || row['Name']?.split(' ')[0] || '',
        lastName: row['Last Name'] || row['Name']?.split(' ').slice(1).join(' ') || '',
        email: row['Email'] || '',
        username: row['Username'] || row['Email']?.split('@')[0] || '',
        password: row['Password'] || 'defaultPassword123',
        phoneNumber: row['Phone Number'] || '',
        dateOfBirth: row['Date of Birth'] ? new Date(row['Date of Birth']) : null,
        gender: row['Gender'] || '',
        about: row['About'] || ''
      }));

      // Validate required fields
      const validStudents = studentsToImport.filter(student => 
        student.firstName && student.lastName && student.email
      );

      if (validStudents.length !== studentsToImport.length) {
        alert(`Warning: ${studentsToImport.length - validStudents.length} rows were skipped due to missing required fields (First Name, Last Name, Email).`);
      }

      if (validStudents.length === 0) {
        alert('No valid student data found in the Excel file.');
        return;
      }

      const response = await fetch('/api/admin/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: validStudents })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully imported ${result.imported} students. ${result.skipped || 0} duplicates were skipped.`);
        fetchStudents();
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import students. Please check the file format.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s._id)));
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john.doe@example.com',
      'Username': 'johndoe',
      'Password': 'password123',
      'Phone Number': '+1234567890',
      'Date of Birth': '1990-01-01',
      'Gender': 'male',
      'About': 'Computer Science student'
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
    
    XLSX.writeFile(workbook, 'students_template.xlsx');
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Students Management</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadTemplate}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" /> Download Template
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> 
                {importing ? 'Importing...' : 'Import Excel'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={students.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> 
                Export {selectedStudents.size > 0 ? `(${selectedStudents.size})` : 'All'}
              </button>
              <Link href="/admin/students/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add Student
              </Link>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto rounded shadow bg-white mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === students.length && students.length > 0}
                        onChange={toggleAllStudents}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-black font-medium">{student.firstName} {student.lastName}</td>
                      <td className="px-6 py-4 text-gray-700">{student.email}</td>
                      <td className="px-6 py-4 text-gray-700">{student.username}</td>
                      <td className="px-6 py-4 text-gray-700">{student.phoneNumber || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{student.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Link href={`/admin/students/${student._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                          <Edit className="h-4 w-4" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          disabled={deletingId === student._id}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === student._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 