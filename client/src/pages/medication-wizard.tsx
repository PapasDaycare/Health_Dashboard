import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { medicationsApi } from "@/lib/medicationsApi";

type Frequency =
  | "Once daily"
  | "Twice daily"
  | "Morning"
  | "Night"
  | "With meals"
  | "As needed (PRN)";

type NewMedicationDraft = {
  name: string;
  dose: string;
  frequency: Frequency | "";
  reason: string;
  notes: string;
  showOnPrint: boolean;
};

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function BigButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-14 w-full rounded-2xl border px-4 text-left text-base font-semibold shadow-sm",
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function MedicationWizardPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const [draft, setDraft] = useState<NewMedicationDraft>({
    name: "",
    dose: "",
    frequency: "",
    reason: "",
    notes: "",
    showOnPrint: true,
  });

  const totalSteps = 5;
  const progressText = useMemo(() => `Step ${step} of ${totalSteps}`, [step]);
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

  function next() {
    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function canNext(): boolean {
    if (step === 1) {
      return draft.name.trim().length > 0;
    }
    if (step === 2) {
      return draft.dose.trim().length > 0;
    }
    if (step === 3) {
      return draft.frequency !== "";
    }
    if (step === 4) {
      return true;
    }
    if (step === 5) {
      return true;
    }
    return false;
  }

  async function save() {
    try {
      await medicationsApi.create({
        name: draft.name,
        dose: draft.dose,
        frequency: String(draft.frequency),
        reason: normalizeReason(draft.reason),
        notes: draft.notes.trim() ? draft.notes.trim() : null,
        showOnPrint: draft.showOnPrint,
      });
      setLocation("/medications");
    } catch (e: any) {
      alert(e?.message ?? "Failed to save medication");
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{progressText}</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">Add a Medication</h2>
        </div>

        <button
          type="button"
          onClick={() => setLocation("/medications")}
          className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {step === 1 && (
        <StepShell title="What is the name of the medication?" subtitle="Example: Metformin">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="h-14 w-full rounded-2xl border border-gray-300 px-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Medication name"
          />
        </StepShell>
      )}

      {step === 2 && (
        <StepShell title="How much do you take?" subtitle='Example: "10 mg" or "1 tablet"'>
          <input
            value={draft.dose}
            onChange={(e) => setDraft({ ...draft, dose: e.target.value })}
            className="h-14 w-full rounded-2xl border border-gray-300 px-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="Dose"
          />
        </StepShell>
      )}

      {step === 3 && (
        <StepShell title="How often do you take it?" subtitle="Pick the closest match.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                "Once daily",
                "Twice daily",
                "Morning",
                "Night",
                "With meals",
                "As needed (PRN)",
              ] as Frequency[]
            ).map((f) => (
              <BigButton
                key={f}
                active={draft.frequency === f}
                onClick={() => setDraft({ ...draft, frequency: f })}
              >
                {f}
              </BigButton>
            ))}
          </div>
        </StepShell>
      )}

      {step === 4 && (
        <StepShell
          title="What do you take it for?"
          subtitle="If you’re not sure, you can leave this blank."
        >
          <input
            value={draft.reason}
            onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            className="h-14 w-full rounded-2xl border border-gray-300 px-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder={isPrn ? "Example: Pain flare-up" : "Example: Blood pressure"}
          />
          {isPrn ? (
            <p className="mt-2 text-sm text-gray-600">
              PRN selected: if blank, reason will be saved as “As needed”.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {["Blood pressure", "Diabetes", "Cholesterol", "Pain", "Thyroid", "Anxiety"].map(
              (chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setDraft({ ...draft, reason: chip })}
                >
                  {chip}
                </button>
              ),
            )}
          </div>
        </StepShell>
      )}

      {step === 5 && (
        <StepShell title="Extra details (optional)" subtitle="These help your doctor and caregiver.">
          <label className="block">
            <span className="text-sm font-medium text-gray-900">Notes</span>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="mt-1 min-h-[120px] w-full rounded-2xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder='Example: "Take with food"'
            />
          </label>

          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.showOnPrint}
              onChange={(e) => setDraft({ ...draft, showOnPrint: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300"
            />
            <span className="text-base font-semibold text-gray-900">Show on printed list</span>
          </label>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Review</h3>
            <p className="mt-2 text-base text-gray-900">
              <span className="font-semibold">{draft.name || "Medication name"}</span>
              <span className="text-gray-500"> • </span>
              {draft.dose || "Dose"}
              <span className="text-gray-500"> • </span>
              {draft.frequency || "Frequency"}
            </p>
            {draft.reason ? <p className="mt-1 text-sm text-gray-700">Reason: {draft.reason}</p> : null}
          </div>
        </StepShell>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="h-12 rounded-xl border border-gray-300 bg-white px-5 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext()}
            className="h-12 rounded-xl bg-gray-900 px-6 text-base font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={save}
            className="h-12 rounded-xl bg-gray-900 px-6 text-base font-semibold text-white shadow-sm hover:bg-black"
          >
            Save Medication
          </button>
        )}
      </div>
    </div>
  );
}
