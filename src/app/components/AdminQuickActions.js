import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Users, 
  BookOpen, 
  BarChart3, 
  FileText, 
  Settings, 
  Download,
  Upload,
  RefreshCw,
  Shield,
  Bell,
  Calendar
} from 'lucide-react';

export default function AdminQuickActions() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Create new student account',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => router.push('/admin/students/create')
    },
    {
      title: 'Create Problem',
      description: 'Add new coding challenge',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => router.push('/admin/problems/create')
    },
    {
      title: 'Create Test',
      description: 'Build new assessment',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => router.push('/admin/tests/create')
    },
    // {
    //   title: 'Add MCQ',
    //   description: 'Create multiple choice question',
    //   icon: FileText,
    //   color: 'from-orange-500 to-orange-600',
    //   bgColor: 'bg-orange-100',
    //   iconColor: 'text-orange-600',
    //   action: () => router.push('/admin/mcqs/create')
    // }
  ];

  const systemActions = [
    {
      title: 'Export Data',
      description: 'Download reports and data',
      icon: Download,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      action: () => handleExport()
    },
    {
      title: 'Import Data',
      description: 'Bulk import content',
      icon: Upload,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      action: () => handleImport()
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      action: () => router.push('/admin/settings')
    },
    {
      title: 'Security',
      description: 'Manage access and permissions',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      action: () => router.push('/admin/security')
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would implement actual export logic
      alert('Export completed successfully!');
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would implement actual import logic
      alert('Import completed successfully!');
    } catch (error) {
      alert('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const renderActionCard = (action, index) => {
    const Icon = action.icon;
    return (
      <button
        key={index}
        onClick={action.action}
        className="group relative bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`h-6 w-6 ${action.iconColor}`} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
              {action.description}
            </p>
          </div>
        </div>
        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200`}></div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <br/>
      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => renderActionCard(action, index))}
        </div>
      </div>

      {/* System Actions */}
      {/* <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">System & Maintenance</h2>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600">System Status: Healthy</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemActions.map((action, index) => renderActionCard(action, index))}
        </div>
      </div> */}

      {/* Status Indicators */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">Database</p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">Judge0</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">API</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-900">Storage</p>
            <p className="text-xs text-gray-500">85%</p>
          </div>
        </div>
      </div>

      {/* Loading States */}
      {(isExporting || isImporting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <div>
              <p className="font-semibold text-gray-900">
                {isExporting ? 'Exporting Data...' : 'Importing Data...'}
              </p>
              <p className="text-sm text-gray-500">Please wait, this may take a few moments.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
