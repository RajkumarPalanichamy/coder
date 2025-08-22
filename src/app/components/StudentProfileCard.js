export default function StudentProfileCard({ user, isCollapsed, notifications, onNotificationClick }) {
  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">
          {initials}
        </div>
        {notifications > 0 && (
          <button
            onClick={onNotificationClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            {notifications}
          </button>
        )}
      </div>
      <div className="text-lg font-semibold text-gray-900 text-center">
        {user.firstName} {user.lastName}
      </div>
      {/* <div className="text-sm text-gray-500 text-center">{user.email}</div> */}
      {user.username && (
        <div className="text-sm text-gray-500">@{user.username}</div>
      )}
      {/* <div className="mt-2 text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
        Active
      </div> */}
    </div>
  );
} 