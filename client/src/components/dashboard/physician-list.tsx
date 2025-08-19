import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone } from "lucide-react";
import { type Physician } from "@shared/schema";

interface PhysicianListProps {
  physicians: Physician[];
  onAddPhysician: () => void;
  onScheduleAppointment: (physicianId: string) => void;
  onEditPhysician: (physicianId: string) => void;
}

const getInitials = (firstName: string, lastName: string) => {
  return (firstName[0] + lastName[0]).toUpperCase();
};

const getPhysicianColor = (index: number) => {
  const colors = [
    "bg-medical-blue",
    "bg-medical-green", 
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500"
  ];
  return colors[index % colors.length];
};

export default function PhysicianList({ 
  physicians, 
  onAddPhysician, 
  onScheduleAppointment, 
  onEditPhysician 
}: PhysicianListProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Physicians</h3>
          <Button 
            variant="link"
            className="text-medical-blue hover:text-medical-blue/80 text-sm font-medium p-0"
            data-testid="button-view-all-physicians"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {physicians.map((physician, index) => (
            <div key={physician.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getPhysicianColor(index)} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-semibold text-sm">
                      {getInitials(physician.firstName, physician.lastName)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      Dr. {physician.firstName} {physician.lastName}
                    </h4>
                    <p className="text-medical-gray">{physician.specialty}</p>
                    <div className="flex items-center mt-1 text-sm text-medical-gray">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{physician.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-medical-blue text-white hover:bg-medical-blue/90"
                    onClick={() => onScheduleAppointment(physician.id)}
                    data-testid={`button-schedule-${physician.id}`}
                  >
                    Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => onEditPhysician(physician.id)}
                    data-testid={`button-edit-${physician.id}`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-white text-medical-gray hover:bg-gray-50"
            onClick={onAddPhysician}
            data-testid="button-add-physician"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Physician
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
