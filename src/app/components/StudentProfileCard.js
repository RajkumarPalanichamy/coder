export default function StudentProfileCard({ student }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">
        {student.firstName[0]}{student.lastName[0]}
      </div>
      <div className="text-lg font-semibold text-gray-900">{student.firstName} {student.lastName}</div>
      <div className="text-sm text-gray-500">{student.email}</div>
      <div className="text-sm text-gray-500">@{student.username}</div>
      <div className="mt-2 text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
        {student.isActive ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
} 