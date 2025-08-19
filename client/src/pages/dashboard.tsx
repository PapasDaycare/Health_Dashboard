import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Calendar, Bell, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Physician, type Appointment, type InsertPhysician, type InsertAppointment } from "@shared/schema";

import StatsCard from "@/components/dashboard/stats-card";
import PhysicianList from "@/components/dashboard/physician-list";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import QuickActions from "@/components/dashboard/quick-actions";
import AddPhysicianModal from "@/components/physicians/add-physician-modal";
import ScheduleAppointmentModal from "@/components/appointments/schedule-appointment-modal";

interface DashboardStats {
  totalPhysicians: number;
  upcomingAppointments: number;
  pendingReminders: number;
  monthlyAppointments: number;
}

export default function Dashboard() {
  const [isAddPhysicianModalOpen, setIsAddPhysicianModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPhysicianId, setSelectedPhysicianId] = useState<string | undefined>();
  
  const user = getCurrentUser();
  const { toast } = useToast();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", user.id],
    queryFn: () => fetch(`/api/dashboard/stats?userId=${user.id}`).then(res => res.json()),
  });

  // Fetch physicians
  const { data: physicians = [], isLoading: physiciansLoading } = useQuery<Physician[]>({
    queryKey: ["/api/physicians", user.id],
    queryFn: () => fetch(`/api/physicians?userId=${user.id}`).then(res => res.json()),
  });

  // Fetch upcoming appointments
  const { data: upcomingAppointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/upcoming", user.id],
    queryFn: () => fetch(`/api/appointments/upcoming?userId=${user.id}`).then(res => res.json()),
  });

  // Add physician mutation
  const addPhysicianMutation = useMutation({
    mutationFn: (data: InsertPhysician) => apiRequest("POST", "/api/physicians", data),
    onSuccess: () => {
      toast({ title: "Physician added successfully" });
      setIsAddPhysicianModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/physicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({ title: "Failed to add physician", variant: "destructive" });
    },
  });

  // Schedule appointment mutation
  const scheduleAppointmentMutation = useMutation({
    mutationFn: (data: InsertAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      toast({ title: "Appointment scheduled successfully" });
      setIsScheduleModalOpen(false);
      setSelectedPhysicianId(undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({ title: "Failed to schedule appointment", variant: "destructive" });
    },
  });

  const handleAddPhysician = () => {
    setIsAddPhysicianModalOpen(true);
  };

  const handleScheduleAppointment = (physicianId?: string) => {
    setSelectedPhysicianId(physicianId);
    setIsScheduleModalOpen(true);
  };

  const handleEditPhysician = (physicianId: string) => {
    // TODO: Implement edit physician functionality
    toast({ title: "Edit physician functionality coming soon" });
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    toast({ title: "Export functionality coming soon" });
  };

  if (statsLoading || physiciansLoading || appointmentsLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Physicians"
            value={stats?.totalPhysicians || 0}
            icon={Users}
            iconBgColor="bg-medical-blue-light"
            iconColor="text-medical-blue"
          />
          <StatsCard
            title="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            icon={Calendar}
            iconBgColor="bg-medical-green-light"
            iconColor="text-medical-green"
          />
          <StatsCard
            title="Pending Reminders"
            value={stats?.pendingReminders || 0}
            icon={Bell}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="This Month"
            value={stats?.monthlyAppointments || 0}
            icon={Clock}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Physicians */}
          <div className="lg:col-span-2">
            <PhysicianList
              physicians={physicians.slice(0, 5)} // Show first 5 physicians
              onAddPhysician={handleAddPhysician}
              onScheduleAppointment={handleScheduleAppointment}
              onEditPhysician={handleEditPhysician}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UpcomingAppointments
              appointments={upcomingAppointments.slice(0, 3)} // Show first 3 appointments
              physicians={physicians}
              onScheduleAppointment={() => handleScheduleAppointment()}
            />
            
            <QuickActions
              onAddPhysician={handleAddPhysician}
              onScheduleAppointment={() => handleScheduleAppointment()}
              onExportData={handleExportData}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPhysicianModal
        open={isAddPhysicianModalOpen}
        onOpenChange={setIsAddPhysicianModalOpen}
        onSubmit={addPhysicianMutation.mutate}
        isLoading={addPhysicianMutation.isPending}
      />

      <ScheduleAppointmentModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        onSubmit={scheduleAppointmentMutation.mutate}
        physicians={physicians}
        selectedPhysicianId={selectedPhysicianId}
        isLoading={scheduleAppointmentMutation.isPending}
      />
    </div>
  );
}
