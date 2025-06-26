"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Students Management</h1>
            <Link href="/admin/students/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add Student
            </Link>
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