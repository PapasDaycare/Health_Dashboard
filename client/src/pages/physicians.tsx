import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Phone, Mail, MapPin, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Physician, type InsertPhysician } from "@shared/schema";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPhysicianModal from "@/components/physicians/add-physician-modal";

export default function Physicians() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const user = getCurrentUser();
  const { toast } = useToast();

  // Fetch physicians
  const { data: physicians = [], isLoading } = useQuery<Physician[]>({
    queryKey: ["/api/physicians", user.id],
    queryFn: () => fetch(`/api/physicians?userId=${user.id}`).then(res => res.json()),
  });

  // Add physician mutation
  const addPhysicianMutation = useMutation({
    mutationFn: (data: InsertPhysician) => apiRequest("POST", "/api/physicians", data),
    onSuccess: () => {
      toast({ title: "Physician added successfully" });
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/physicians"] });
    },
    onError: () => {
      toast({ title: "Failed to add physician", variant: "destructive" });
    },
  });

  // Filter physicians based on search query
  const filteredPhysicians = physicians.filter(physician => 
    `${physician.firstName} ${physician.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    physician.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Physicians</h1>
            <p className="text-gray-600 mt-2">Manage your healthcare providers</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-medical-blue hover:bg-medical-blue/90"
            data-testid="button-add-physician"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Physician
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search physicians..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-physicians"
            />
          </div>
        </div>

        {/* Physicians Grid */}
        {filteredPhysicians.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No physicians found" : "No physicians yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first physician"
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-medical-blue hover:bg-medical-blue/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Physician
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhysicians.map((physician, index) => (
              <Card key={physician.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getPhysicianColor(index)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {getInitials(physician.firstName, physician.lastName)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {physician.firstName} {physician.lastName}
                      </h3>
                      <p className="text-medical-gray">{physician.specialty}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{physician.phone}</span>
                  </div>
                  
                  {physician.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{physician.email}</span>
                    </div>
                  )}
                  
                  {physician.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{physician.address}</span>
                    </div>
                  )}

                  <div className="pt-3 flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-medical-blue text-white hover:bg-medical-blue/90"
                      data-testid={`button-schedule-${physician.id}`}
                    >
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      data-testid={`button-edit-${physician.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Physician Modal */}
      <AddPhysicianModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={addPhysicianMutation.mutate}
        isLoading={addPhysicianMutation.isPending}
      />
    </div>
  );
}
