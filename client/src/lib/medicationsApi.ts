import { apiRequest } from "@/lib/queryClient";

export type Medication = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  reason: string | null;
  notes: string | null;
  showOnPrint: boolean;
};

export type CreateMedicationInput = {
  name: string;
  dose: string;
  frequency: string;
  reason: string | null;
  notes: string | null;
  showOnPrint: boolean;
};

export const medicationsApi = {
  async list(): Promise<Medication[]> {
    const res = await fetch("/api/medications", {
      credentials: "include",
    });

    if (!res.ok) {
      const message = (await res.text()) || "Failed to load medications";
      throw new Error(message);
    }

    return res.json();
  },

  async create(input: CreateMedicationInput) {
    const res = await apiRequest("POST", "/api/medications", input);
    return res.json();
  },

  async get(id: string): Promise<Medication> {
    const res = await fetch(`/api/medications/${id}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const message = (await res.text()) || "Failed to load medication";
      throw new Error(message);
    }

    return res.json();
  },

  async update(id: string, input: CreateMedicationInput): Promise<Medication> {
    const res = await apiRequest("PUT", `/api/medications/${id}`, input);
    return res.json();
  },

  async remove(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/medications/${id}`);
  },

  async setShowOnPrint(id: string, showOnPrint: boolean): Promise<Medication> {
    const res = await apiRequest("PATCH", `/api/medications/${id}/print`, { showOnPrint });
    return res.json();
  },
};
