import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Clock, User, FileText, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Appointment, type Physician, type InsertAppointment } from "@shared/schema";
import { format } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ScheduleAppointmentModal from "@/components/appointments/schedule-appointment-modal";

export default function Appointments() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const user = getCurrentUser();
  const { toast } = useToast();

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", user.id],
    queryFn: () => fetch(`/api/appointments?userId=${user.id}`).then(res => res.json()),
  });

  // Fetch physicians
  const { data: physicians = [], isLoading: physiciansLoading } = useQuery<Physician[]>({
    queryKey: ["/api/physicians", user.id],
    queryFn: () => fetch(`/api/physicians?userId=${user.id}`).then(res => res.json()),
  });

  // Schedule appointment mutation
  const scheduleAppointmentMutation = useMutation({
    mutationFn: (data: InsertAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      toast({ title: "Appointment scheduled successfully" });
      setIsScheduleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: () => {
      toast({ title: "Failed to schedule appointment", variant: "destructive" });
    },
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment => {
    const physicianName = getPhysicianName(appointment.physicianId).toLowerCase();
    const appointmentType = appointment.type.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return physicianName.includes(query) || appointmentType.includes(query);
  });

  // Sort appointments by date and time
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  if (appointmentsLoading || physiciansLoading) {
    return (
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your medical appointments</p>
          </div>
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-medical-blue hover:bg-medical-blue/90 w-full sm:w-auto"
            data-testid="button-schedule-appointment"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Schedule Appointment</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search appointments..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-appointments"
            />
          </div>
        </div>

        {/* Appointments List */}
        {sortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No appointments found" : "No appointments yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Schedule your first appointment to get started"
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Your First Appointment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {getPhysicianName(appointment.physicianId)}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {getPhysicianSpecialty(appointment.physicianId)}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{formatAppointmentDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span>{formatAppointmentTime(appointment.time)}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-md">
                          <p className="text-xs sm:text-sm text-gray-700">
                            <strong>Notes:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col gap-2 sm:ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                        data-testid={`button-edit-${appointment.id}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 text-xs sm:text-sm"
                        data-testid={`button-cancel-${appointment.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        onSubmit={scheduleAppointmentMutation.mutate}
        physicians={physicians}
        isLoading={scheduleAppointmentMutation.isPending}
      />
    </div>
  );
}
