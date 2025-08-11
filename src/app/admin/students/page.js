"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, UserPlus, Download, Upload, CheckSquare, Square } from 'lucide-react';
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
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

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
      setSelectedStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch {
      alert("Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (id) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudents(newSet);
    setSelectAll(newSet.size === students.length);
  };

  const handleExportToExcel = () => {
    const dataToExport = selectedStudents.size > 0 
      ? students.filter(s => selectedStudents.has(s._id))
      : students;

    const excelData = dataToExport.map(student => ({
      'Name': `${student.firstName} ${student.lastName}`,
      'Email': student.email,
      'Username': student.username,
      'Password': '', // Empty for security
      'Confirm Password': '', // Empty for security
      'Status': student.isActive ? 'Active' : 'Inactive',
      'Created Date': new Date(student.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    // Auto-size columns
    const max_width = excelData.reduce((w, r) => Math.max(w, r.Email.length), 10);
    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: max_width + 5 }, // Email
      { wch: 15 }, // Username
      { wch: 15 }, // Password
      { wch: 15 }, // Confirm Password
      { wch: 10 }, // Status
      { wch: 15 }  // Created Date
    ];

    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Process imported data
        const studentsToImport = data.map(row => ({
          firstName: row['Name'] ? row['Name'].split(' ')[0] : '',
          lastName: row['Name'] ? row['Name'].split(' ').slice(1).join(' ') : '',
          email: row['Email'] || '',
          username: row['Username'] || '',
          password: row['Password'] || '',
          confirmPassword: row['Confirm Password'] || '',
          isActive: row['Status'] === 'Active'
        })).filter(s => s.email && s.username); // Filter out invalid entries

        if (studentsToImport.length === 0) {
          alert('No valid students found in the Excel file');
          return;
        }

        // Send to API
        const response = await fetch('/api/admin/students/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: studentsToImport })
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Successfully imported ${result.imported} students`);
          fetchStudents(); // Refresh the list
        } else {
          const error = await response.json();
          alert(`Import failed: ${error.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to import Excel file. Please check the format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select students to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedStudents.size} students?`)) return;
    
    try {
      await Promise.all(
        Array.from(selectedStudents).map(id => 
          fetch(`/api/admin/students/${id}`, { method: "DELETE" })
        )
      );
      setStudents(students.filter(s => !selectedStudents.has(s._id)));
      setSelectedStudents(new Set());
      setSelectAll(false);
    } catch {
      alert("Failed to delete some students.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Students Management</h1>
            <div className="flex gap-2 flex-wrap">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
                id="excel-upload"
              />
              <label 
                htmlFor="excel-upload"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Import Excel
              </label>
              <button 
                onClick={handleExportToExcel}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Excel
              </button>
              {selectedStudents.size > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected ({selectedStudents.size})
                </button>
              )}
              <Link href="/admin/students/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Add Student
              </Link>
            </div>
          </div>
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
                      <button 
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                      >
                        {selectAll ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleSelectStudent(student._id)}
                          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                        >
                          {selectedStudents.has(student._id) ? 
                            <CheckSquare className="h-4 w-4" /> : 
                            <Square className="h-4 w-4" />
                          }
                        </button>
                      </td>
                      <td className="px-6 py-4 text-black font-medium">{student.firstName} {student.lastName}</td>
                      <td className="px-6 py-4 text-gray-700">{student.email}</td>
                      <td className="px-6 py-4 text-gray-700">{student.username}</td>
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