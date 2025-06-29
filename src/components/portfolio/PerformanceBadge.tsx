import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface PerformanceBadgeProps {
  percentage: number
  className?: string
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ 
  percentage, 
  className = "" 
}) => {
  const isPositive = percentage >= 0
  const absPercentage = Math.abs(percentage)
  
  return (
    <span className={classNames(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      isPositive 
        ? "bg-emerald-100 text-emerald-800" 
        : "bg-red-100 text-red-800",
      className
    )}>
      {isPositive ? (
        <ArrowUpIcon className="w-3 h-3 mr-1" />
      ) : (
        <ArrowDownIcon className="w-3 h-3 mr-1" />
      )}
      {isPositive ? '+' : ''}{absPercentage.toFixed(2)}%
    </span>
  )
}