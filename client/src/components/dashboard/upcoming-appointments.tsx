import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock } from "lucide-react";
import { type Appointment, type Physician } from "@shared/schema";
import { format } from "date-fns";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  physicians: Physician[];
  onScheduleAppointment: () => void;
}

const getAppointmentColor = (index: number) => {
  const colors = [
    "bg-medical-blue",
    "bg-medical-green", 
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500"
  ];
  return colors[index % colors.length];
};

export default function UpcomingAppointments({ 
  appointments, 
  physicians, 
  onScheduleAppointment 
}: UpcomingAppointmentsProps) {
  const getPhysicianName = (physicianId: string) => {
    const physician = physicians.find(p => p.id === physicianId);
    return physician ? `Dr. ${physician.firstName} ${physician.lastName}` : "Unknown Physician";
  };

  const getPhysicianSpecialty = (physicianId: string) => {
    const physician = physicians.find(p => p.id === physicianId);
    return physician?.specialty || "Unknown Specialty";
  };

  const formatAppointmentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatAppointmentTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return timeStr;
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No upcoming appointments
            </div>
          ) : (
            appointments.map((appointment, index) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 ${getAppointmentColor(index)} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getPhysicianName(appointment.physicianId)}
                    </p>
                    <p className="text-sm text-medical-gray">
                      {appointment.type} - {getPhysicianSpecialty(appointment.physicianId)}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-medical-gray">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatAppointmentDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-medical-gray">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatAppointmentTime(appointment.time)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-white text-medical-gray hover:bg-gray-50"
            onClick={onScheduleAppointment}
            data-testid="button-schedule-appointment"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
