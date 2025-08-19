import { CheckCircle, Clock, Circle } from 'lucide-react';

export default function ProblemStatusCard({ 
  problemNumber, 
  title, 
  status, // 'answered', 'current', 'not-answered'
  onClick,
  points,
  timeAllowed 
}) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'answered':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 hover:bg-green-100',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          statusText: 'Answered',
          statusBg: 'bg-green-100',
          statusTextColor: 'text-green-800'
        };
      case 'current':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50 hover:bg-blue-100',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          statusText: 'Current',
          statusBg: 'bg-blue-100',
          statusTextColor: 'text-blue-800'
        };
      case 'not-answered':
      default:
        return {
          icon: Circle,
          bgColor: 'bg-gray-50 hover:bg-gray-100',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-400',
          textColor: 'text-gray-900',
          statusText: 'Not Answered',
          statusBg: 'bg-gray-100',
          statusTextColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <div 
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
          <span className="text-sm font-medium text-gray-700">
            Problem {problemNumber}
          </span>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.statusBg} ${config.statusTextColor}`}>
          {config.statusText}
        </span>
      </div>
      
      <h3 className={`text-sm font-medium ${config.textColor} mb-2 line-clamp-2`}>
        {title}
      </h3>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <span className="font-medium">{points}</span>
            <span className="ml-1">pts</span>
          </span>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{timeAllowed} min</span>
          </span>
        </div>
      </div>
    </div>
  );
}