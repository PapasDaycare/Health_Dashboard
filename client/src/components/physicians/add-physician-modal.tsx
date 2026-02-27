import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPhysicianSchema, type InsertPhysician, type Physician } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const physicianFormSchema = insertPhysicianSchema.extend({
  specialty: z.string().min(1, "Specialty is required"),
});

interface AddPhysicianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertPhysician) => void;
  isLoading?: boolean;
  mode?: "add" | "edit";
  physician?: Physician | null;
}

const specialtyOptions = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "family-medicine", label: "Family Medicine" },
  { value: "FNP", label: "Family Nurse Practitioner (FNP)" },
  { value: "NP", label: "Nurse Practitioner (NP)" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "other", label: "Other" },
];

export default function AddPhysicianModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading = false,
  mode = "add",
  physician = null,
}: AddPhysicianModalProps) {
  const { user } = useAuth();
  const userId = user?.id || "";
  
  const form = useForm<z.infer<typeof physicianFormSchema>>({
    resolver: zodResolver(physicianFormSchema),
    defaultValues: {
      userId,
      firstName: "",
      lastName: "",
      specialty: "",
      phone: "",
      email: "",
      address: "",
      officeHours: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      userId,
      firstName: physician?.firstName ?? "",
      lastName: physician?.lastName ?? "",
      specialty: physician?.specialty ?? "",
      phone: physician?.phone ?? "",
      email: physician?.email ?? "",
      address: physician?.address ?? "",
      officeHours: physician?.officeHours ?? "",
    });
  }, [form, open, physician, userId]);

  const handleSubmit = (values: z.infer<typeof physicianFormSchema>) => {
    onSubmit(values);
  };

  const title = mode === "edit" ? "Edit Physician" : "Add New Physician";
  const submitText = mode === "edit" ? "Save Changes" : "Add Physician";
  const submittingText = mode === "edit" ? "Saving..." : "Adding...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Specialty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-specialty">
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialtyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="(555) 123-4567"
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ""}
                        type="email"
                        placeholder="doctor@hospital.com"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value ?? ""}
                      rows={3}
                      placeholder="123 Medical Center Dr, Suite 100&#10;City, State 12345"
                      data-testid="textarea-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="officeHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Hours</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value ?? ""}
                      rows={3}
                      placeholder="Monday - Friday: 9:00 AM - 5:00 PM&#10;Saturday: 9:00 AM - 1:00 PM&#10;Sunday: Closed"
                      data-testid="textarea-office-hours"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto bg-medical-blue hover:bg-medical-blue/90 order-1 sm:order-2"
                data-testid="button-submit"
              >
                {isLoading ? submittingText : submitText}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
