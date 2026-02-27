export type PatientProfile = {
  fullName: string;
  dob: string;
  allergies: string;
  emergencyContact: string;
  pharmacy: string;
};

export const patientProfileApi = {
  async get(): Promise<PatientProfile | null> {
    const res = await fetch("/api/patient-print-profile", {
      credentials: "include",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const message = (await res.text()) || "Failed to load patient profile";
      throw new Error(message);
    }

    return res.json();
  },
};
