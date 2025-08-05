import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  icon: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'success' | 'destructive' | 'outline';
  };
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color = 'blue',
  badge 
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'border-l-blue-500'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950',
      icon: 'text-green-600 dark:text-green-400',
      accent: 'border-l-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      icon: 'text-yellow-600 dark:text-yellow-400',
      accent: 'border-l-yellow-500'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'border-l-red-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      icon: 'text-purple-600 dark:text-purple-400',
      accent: 'border-l-purple-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`relative overflow-hidden border-l-4 ${classes.accent} hover:shadow-md transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${classes.bg}`}>
          <Icon className={`h-4 w-4 ${classes.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {badge && (
              <Badge 
                variant={badge.variant === 'success' ? 'default' : badge.variant}
                className={badge.variant === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          badge.variant === 'outline' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
              >
                {badge.text}
              </Badge>
            )}
            
            {trend && (
              <div className={`flex items-center text-xs ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend.value}% {trend.label}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}