import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { medicationsApi } from "@/lib/medicationsApi";

type Frequency =
  | "Once daily"
  | "Twice daily"
  | "Morning"
  | "Night"
  | "With meals"
  | "As needed (PRN)";

type EditMedicationDraft = {
  name: string;
  dose: string;
  frequency: Frequency | "";
  reason: string;
  notes: string;
  showOnPrint: boolean;
};

const FREQUENCY_OPTIONS: Frequency[] = [
  "Once daily",
  "Twice daily",
  "Morning",
  "Night",
  "With meals",
  "As needed (PRN)",
];

export default function MedicationsEditPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/medications/:id/edit");
  const medicationId = match ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditMedicationDraft>({
    name: "",
    dose: "",
    frequency: "",
    reason: "",
    notes: "",
    showOnPrint: true,
  });

  useEffect(() => {
    if (!medicationId) {
      setError("Medication not found");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const medication = await medicationsApi.get(medicationId);
        setDraft({
          name: medication.name,
          dose: medication.dose,
          frequency: (medication.frequency as Frequency) || "",
          reason: medication.reason ?? "",
          notes: medication.notes ?? "",
          showOnPrint: medication.showOnPrint,
        });
      } catch (e: any) {
        setError(e?.message ?? "Failed to load medication");
      } finally {
        setLoading(false);
      }
    })();
  }, [medicationId]);

  const isPrn = useMemo(() => draft.frequency === "As needed (PRN)", [draft.frequency]);

  function normalizeReason(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
    if (isPrn) {
      return "As needed";
    }
    return null;
  }

  async function save() {
    if (!medicationId) {
      return;
    }

    if (!draft.name.trim() || !draft.dose.trim() || !draft.frequency) {
      alert("Name, dose, and frequency are required.");
      return;
    }

    try {
      setSaving(true);
      await medicationsApi.update(medicationId, {
        name: draft.name.trim(),
        dose: draft.dose.trim(),
        frequency: String(draft.frequency),
        reason: normalizeReason(draft.reason),
        notes: draft.notes.trim() ? draft.notes.trim() : null,
        showOnPrint: draft.showOnPrint,
      });
      setLocation("/medications");
    } catch (e: any) {
      alert(e?.message ?? "Failed to save medication");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Loading medication...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Medication</h2>
          <p className="mt-1 text-sm text-gray-600">Update dose, frequency, print setting, and notes.</p>
        </div>

        <button
          type="button"
          onClick={() => setLocation("/medications")}
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-900">Medication name</span>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Dose</span>
          <input
            value={draft.dose}
            onChange={(e) => setDraft({ ...draft, dose: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Frequency</span>
          <select
            value={draft.frequency}
            onChange={(e) => setDraft({ ...draft, frequency: e.target.value as Frequency })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">Select frequency</option>
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Reason</span>
          <input
            value={draft.reason}
            onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder={isPrn ? "Example: Pain flare-up" : "Example: Blood pressure"}
          />
          {isPrn ? (
            <p className="mt-1 text-xs text-gray-600">
              PRN selected: if this is blank, reason will save as “As needed”.
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-900">Notes</span>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            className="mt-1 min-h-[120px] w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder={isPrn ? "Example: Take 1 tablet for breakthrough pain" : "Optional notes"}
          />
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.showOnPrint}
            onChange={(e) => setDraft({ ...draft, showOnPrint: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300"
          />
          <span className="text-base font-semibold text-gray-900">Show on printed list</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-12 rounded-xl bg-gray-900 px-6 text-base font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
