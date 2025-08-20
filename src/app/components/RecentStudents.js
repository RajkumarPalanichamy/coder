import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students?limit=5', { credentials: 'include' });
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching recent students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="font-semibold">{student.firstName} {student.lastName}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}