import { ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

type StatusType = 'live' | 'updated' | 'outperforming' | 'underperforming' | 'neutral'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = "" 
}) => {
  const configs = {
    live: { bg: "bg-green-100", text: "text-green-800", label: "Live" },
    updated: { bg: "bg-blue-100", text: "text-blue-800", label: "Aktualisiert" },
    outperforming: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Übertrifft Markt" },
    underperforming: { bg: "bg-red-100", text: "text-red-800", label: "Unter Markt" },
    neutral: { bg: "bg-gray-100", text: "text-gray-800", label: "Neutral" }
  }
  
  const config = configs[status] || configs.neutral
  
  return (
    <span className={classNames(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      {status === 'live' && <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />}
      {status === 'updated' && <ClockIcon className="w-3 h-3 mr-1" />}
      {status === 'outperforming' && <ChartBarIcon className="w-3 h-3 mr-1" />}
      {status === 'underperforming' && <ChartBarIcon className="w-3 h-3 mr-1" />}
      {config.label}
    </span>
  )
}