import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconBgColor, 
  iconColor 
}: StatsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
              <Icon className={cn("h-4 w-4 sm:h-6 sm:w-6", iconColor)} />
            </div>
          </div>
          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
