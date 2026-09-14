"use client";
import { Suspense, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit, FileSpreadsheet, Search, Trash2, Upload, UserPlus } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import CreateStudentModal from '../../components/CreateStudentModal';
import EditStudentModal from '../../components/EditStudentModal';
import BulkImportStudentsModal from '../../components/BulkImportStudentsModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { downloadStudentImportTemplate } from '../../../lib/excelExport';

const PAGE_SIZE = 50;

function AdminStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const create = searchParams.get('create');
    const edit = searchParams.get('edit');
    if (create === 'true') {
      setShowCreateModal(true);
      router.replace('/admin/students', { scroll: false });
    } else if (edit) {
      setEditingStudentId(edit);
      router.replace('/admin/students', { scroll: false });
    }
  }, [searchParams, router]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/students?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
      await fetch(`/api/admin/students/${id}`, { method: "DELETE", credentials: 'include' });
      fetchStudents();
    } catch {
      alert("Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    window.location.href = `/api/admin/students/export?${params.toString()}`;
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">Students Management</h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => downloadStudentImportTemplate()}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Template Sheet
              </button>
              <button
                type="button"
                onClick={() => setShowBulkImportModal(true)}
                className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Bulk Import
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" /> Add Student
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
              />
            </div>
            {!loading && !error && (
              <p className="text-sm text-gray-500">{total.toLocaleString()} student{total === 1 ? '' : 's'} total</p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No students found.</div>
          ) : (
            <>
              <div className="overflow-x-auto rounded shadow bg-white mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 text-black font-medium">{student.firstName} {student.lastName}</td>
                        <td className="px-6 py-4 text-gray-700">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{student.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => setEditingStudentId(student._id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </button>
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

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateStudentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchStudents()}
        />
      )}

      {showBulkImportModal && (
        <BulkImportStudentsModal
          onClose={() => setShowBulkImportModal(false)}
          onImported={() => fetchStudents()}
        />
      )}

      {editingStudentId && (
        <EditStudentModal
          studentId={editingStudentId}
          onClose={() => setEditingStudentId(null)}
          onSuccess={() => fetchStudents()}
        />
      )}
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <AdminStudentsContent />
    </Suspense>
  );
}
