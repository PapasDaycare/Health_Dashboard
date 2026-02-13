import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CalendarPlus, Download } from "lucide-react";

interface QuickActionsProps {
  onAddPhysician: () => void;
  onScheduleAppointment: () => void;
  onExportData: () => void;
}

export default function QuickActions({ 
  onAddPhysician, 
  onScheduleAppointment, 
  onExportData 
}: QuickActionsProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
        <Button
          className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left bg-medical-blue-light text-medical-blue rounded-lg hover:bg-medical-blue hover:text-white transition-colors text-sm"
          onClick={onAddPhysician}
          data-testid="button-quick-add-physician"
        >
          <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">Add New Physician</span>
        </Button>
        <Button
          className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left bg-medical-green-light text-medical-green rounded-lg hover:bg-medical-green hover:text-white transition-colors text-sm"
          onClick={onScheduleAppointment}
          data-testid="button-quick-schedule-appointment"
        >
          <CalendarPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">Schedule Appointment</span>
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          onClick={onExportData}
          data-testid="button-export-data"
        >
          <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="truncate">Export Data</span>
        </Button>
      </CardContent>
    </Card>
  );
}
