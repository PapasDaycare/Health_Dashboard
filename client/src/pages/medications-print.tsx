import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { medicationsApi, type Medication } from "@/lib/medicationsApi";
import { patientProfileApi, type PatientProfile } from "@/lib/patientProfileApi";

export default function MedicationsPrintPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const printableMeds = useMemo(
    () => meds.filter((m) => m.showOnPrint).sort((a, b) => a.name.localeCompare(b.name)),
    [meds],
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [m, p] = await Promise.all([medicationsApi.list(), patientProfileApi.get()]);
        setMeds(m);
        setProfile(p);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load print view");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="mb-6 print:hidden">
          <Link
            href="/medications"
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 inline-flex items-center"
          >
            ← Back
          </Link>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
      </div>
    );
  }

  const printedDate = new Date().toLocaleDateString();

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/medications"
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 flex items-center"
        >
          ← Back
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-black"
        >
          Print
        </button>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medication List</h1>
            <p className="mt-2 text-base text-gray-700">
              Keep this list updated for doctor visits and emergencies.
            </p>
            {profile?.pharmacy ? (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Pharmacy:</span> {profile.pharmacy}
              </p>
            ) : null}
          </div>
          <div className="text-right text-sm text-gray-700">
            <p className="font-semibold">Printed:</p>
            <p>{printedDate}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900">Name</p>
            <p className="mt-1 text-lg text-gray-900">{profile?.fullName || "________________________"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900">DOB</p>
            <p className="mt-1 text-lg text-gray-900">{profile?.dob || "________________________"}</p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-gray-900">Allergies</p>
            <p className="mt-1 text-lg text-gray-900">{profile?.allergies || "________________________"}</p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-gray-900">Emergency Contact</p>
            <p className="mt-1 text-lg text-gray-900">
              {profile?.emergencyContact || "________________________"}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-gray-900">Medications</h2>

        <div className="mt-4 space-y-3">
          {printableMeds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-base text-gray-700">
              No medications are set to print yet.
            </div>
          ) : (
            printableMeds.map((m) => (
              <div key={m.id} className="rounded-xl border border-gray-200 p-4">
                <p className="text-xl font-semibold text-gray-900">{m.name}</p>
                <p className="mt-1 text-lg text-gray-900">
                  {m.dose} <span className="text-gray-500">•</span> {m.frequency}
                </p>
                {m.reason ? (
                  <p className="mt-1 text-base text-gray-800">
                    <span className="font-semibold">Reason:</span> {m.reason}
                  </p>
                ) : null}
                {m.notes ? (
                  <p className="mt-1 text-base text-gray-800">
                    <span className="font-semibold">Notes:</span> {m.notes}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-600">
          <p>Generated with HealthVault</p>
        </div>
      </div>
    </div>
  );
}
