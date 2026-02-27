import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { medicationsApi, type Medication } from "@/lib/medicationsApi";

type Frequency =
  | "Once daily"
  | "Twice daily"
  | "Morning"
  | "Night"
  | "With meals"
  | "As needed (PRN)";

type PatientInfo = {
  fullName: string;
  dob: string;
  allergies: string;
  emergencyContact: string;
  pharmacy: string;
};

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}

function MedicationCard({
  med,
  onRemove,
  onTogglePrint,
}: {
  med: Medication;
  onRemove: (id: string) => void;
  onTogglePrint: (id: string, nextValue: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">{med.name}</h2>
            {med.frequency === "As needed (PRN)" ? <Pill>PRN</Pill> : null}
            {!med.showOnPrint ? <Pill>Not on print</Pill> : null}
          </div>

          <p className="mt-2 text-base text-gray-800">
            <span className="font-medium">{med.dose}</span>
            <span className="text-gray-500"> • </span>
            <span>{med.frequency}</span>
          </p>

          {med.reason ? (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Reason:</span> {med.reason}
            </p>
          ) : null}

          {med.notes ? (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {med.notes}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <button
            onClick={() => onTogglePrint(med.id, !med.showOnPrint)}
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            type="button"
          >
            {med.showOnPrint ? "Hide from print" : "Show on print"}
          </button>
          <Link
            href={`/medications/${med.id}/edit`}
            className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 flex items-center justify-center"
          >
            Edit
          </Link>
          <button
            onClick={() => onRemove(med.id)}
            className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientInfoPanel({
  info,
  setInfo,
}: {
  info: PatientInfo;
  setInfo: (next: PatientInfo) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Your Info (for printing)</h3>
      <p className="mt-1 text-sm text-gray-600">
        Keep this accurate so your printed list is ready for appointments and emergencies.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-900">Full name</span>
          <input
            value={info.fullName}
            onChange={(e) => setInfo({ ...info, fullName: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Example: Tammy Price"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Date of birth</span>
          <input
            value={info.dob}
            onChange={(e) => setInfo({ ...info, dob: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="MM/DD/YYYY"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Allergies</span>
          <input
            value={info.allergies}
            onChange={(e) => setInfo({ ...info, allergies: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Example: Penicillin"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Emergency contact</span>
          <input
            value={info.emergencyContact}
            onChange={(e) => setInfo({ ...info, emergencyContact: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Name + phone"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Preferred pharmacy</span>
          <input
            value={info.pharmacy}
            onChange={(e) => setInfo({ ...info, pharmacy: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Example: Walgreens (Alpena)"
          />
        </label>
      </div>
    </div>
  );
}

export default function MedicationsPage() {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: "",
    dob: "",
    allergies: "",
    emergencyContact: "",
    pharmacy: "",
  });

  const [query, setQuery] = useState("");
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await medicationsApi.list();
        setMeds(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load medications");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return meds;
    }

    return meds.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        (m.reason ?? "").toLowerCase().includes(q) ||
        (m.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [meds, query]);

  function removeMed(id: string) {
    const med = meds.find((m) => m.id === id);
    const ok = window.confirm(`Remove ${med?.name ?? "this medication"} from your list?`);
    if (!ok) {
      return;
    }

    (async () => {
      try {
        await medicationsApi.remove(id);
        setMeds((prev) => prev.filter((m) => m.id !== id));
      } catch (e: any) {
        alert(e?.message ?? "Failed to remove medication");
      }
    })();
  }

  function toggleShowOnPrint(id: string, nextValue: boolean) {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, showOnPrint: nextValue } : m)));

    (async () => {
      try {
        await medicationsApi.setShowOnPrint(id, nextValue);
      } catch (e: any) {
        setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, showOnPrint: !nextValue } : m)));
        alert(e?.message ?? "Failed to update print setting");
      }
    })();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionTitle
          title="Medication List"
          subtitle="Keep this updated for doctor visits and emergencies."
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/medications/new"
            className="h-12 rounded-xl bg-gray-900 px-5 text-base font-semibold text-white shadow-sm hover:bg-black flex items-center justify-center"
          >
            + Add Medication
          </Link>

          <Link
            href="/medications/print"
            className="h-12 rounded-xl border border-gray-300 bg-white px-5 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 flex items-center justify-center"
          >
            Print / Save PDF
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="block">
              <span className="text-sm font-medium text-gray-900">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="Search medications…"
              />
            </label>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
                Loading medications...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="text-xl font-semibold text-gray-900">No medications yet</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Add your medications so you can print a clean, easy list for appointments.
                  </p>
                  <Link
                    href="/medications/new"
                    className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-gray-900 px-6 text-base font-semibold text-white hover:bg-black"
                  >
                    Add your first medication
                  </Link>
                </div>
              </div>
            ) : (
              filtered.map((m) => (
                <MedicationCard
                  key={m.id}
                  med={m}
                  onRemove={removeMed}
                  onTogglePrint={toggleShowOnPrint}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <PatientInfoPanel info={patientInfo} setInfo={setPatientInfo} />

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Helpful tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>• Bring this list to every appointment.</li>
              <li>• Update it whenever a dose changes.</li>
              <li>• Include "as needed" medicines too (PRN).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
