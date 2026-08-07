import { useState } from "react";
import {
  Building2,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Upload,
  FileText,
  Mail,
  Truck,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  PACKAGES,
  ROLE_LABELS,
  loadRequests,
  newTrackingId,
  saveRequests,
  type DocPackage,
  type Delivery,
  type RequestorRole,
  type VaultRequest,
} from "@/lib/vault";

const STEPS = ["Profile", "Requestor Details", "Documents & Payment", "Dissemination"];

const ROLE_CARDS: { role: RequestorRole; Icon: typeof GraduationCap; desc: string }[] = [
  { role: "student", Icon: GraduationCap, desc: "Request your own academic record of enrollment or completion." },
  { role: "employer", Icon: Briefcase, desc: "Third-party employment or background verification agency." },
  { role: "institution", Icon: Building2, desc: "Registrar-to-registrar transfer or admissions verification." },
];

type FormState = Omit<VaultRequest, "id" | "createdAt" | "status">;

const EMPTY: FormState = {
  role: "student",
  fullName: "",
  department: "",
  email: "",
  phone: "",
  formerName: "",
  nameChangeDoc: false,
  studentTrack: "",
  studentId: "",
  verificationId: "",
  releaseFormName: "",
  subjectName: "",
  subjectDob: "",
  pkg: "transcript",
  amount: PACKAGES.transcript.price,
  delivery: "digital",
  recipientEmail: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  notes: "",
};

export function RequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [receipt, setReceipt] = useState<VaultRequest | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): string | null => {
    if (step === 1) {
      if (!form.fullName.trim()) return "Requestor full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "A valid email address is required.";
      if (!form.phone.trim()) return "A contact phone number is required.";
      if (!form.subjectName.trim()) return "The record subject's full name is required.";
      if (form.role !== "student") {
        if (!form.verificationId?.trim()) return "A Verification ID is required for third-party requests.";
        if (!form.releaseFormName?.trim())
          return "A signed FERPA/HIPAA release form must be attached before proceeding.";
      }
    }
    if (step === 3) {
      if (form.delivery === "digital" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail || ""))
        return "A valid secure delivery email is required.";
      if (form.delivery === "usps") {
        if (!form.address1?.trim() || !form.city?.trim() || !form.state?.trim() || !form.postalCode?.trim())
          return "Complete postal address details are required for USPS Registered Mail.";
      }
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const record: VaultRequest = {
      ...form,
      amount: PACKAGES[form.pkg].price,
      id: newTrackingId(),
      createdAt: new Date().toISOString(),
      status: "Submitted",
    };
    saveRequests([record, ...loadRequests()]);
    setReceipt(record);
    onSubmitted();
  };

  if (receipt) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight">Request lodged with the Vault</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Retain your Registry ID. It is the only reference required to track fulfillment.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Registry / Tracking ID
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight sm:text-3xl">{receipt.id}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              navigator.clipboard.writeText(receipt.id);
              toast.success("Registry ID copied");
            }}
          >
            <Copy className="h-4 w-4" /> Copy ID
          </Button>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Service" value={PACKAGES[receipt.pkg].label} />
          <Row label="Fee due" value={`$${receipt.amount}.00`} />
          <Row label="Profile" value={ROLE_LABELS[receipt.role]} />
          <Row
            label="Dissemination"
            value={receipt.delivery === "usps" ? "USPS Registered Mail" : "Digital Transfer"}
          />
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="sm:flex-1">
            <a href={PACKAGES[receipt.pkg].paypal} target="_blank" rel="noopener noreferrer">
              Remit ${receipt.amount}.00 via PayPal <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => {
              setReceipt(null);
              setForm(EMPTY);
              setStep(0);
            }}
          >
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* step indicator */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded-lg border px-3 py-2 transition-colors ${
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : i < step
                  ? "border-success/40 bg-success/10 text-foreground"
                  : "border-border bg-card text-muted-foreground"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">
              Step {i + 1}
            </p>
            <p className="truncate text-sm font-medium">{s}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
        {step === 0 && (
          <Section title="Select your requestor profile" desc="Disclosure requirements differ by profile type.">
            <div className="grid gap-3 md:grid-cols-3">
              {ROLE_CARDS.map(({ role, Icon, desc }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => set("role", role)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    form.role === role
                      ? "border-primary bg-accent/60 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="mt-3 text-sm font-semibold">{ROLE_LABELS[role]}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </button>
              ))}
            </div>
          </Section>
        )}

        {step === 1 && (
          <Section title="Requestor & record subject" desc="All fields are retained under confidential handling.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Jordan A. Reyes" />
              </Field>
              <Field label="Department / Organization">
                <Input value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="Human Resources" />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" />
              </Field>
              <Field label="Phone" required>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 010-2233" />
              </Field>
              <Field label="Record subject — full name" required>
                <Input value={form.subjectName} onChange={(e) => set("subjectName", e.target.value)} placeholder="Name as enrolled" />
              </Field>
              <Field label="Record subject — date of birth">
                <Input type="date" value={form.subjectDob} onChange={(e) => set("subjectDob", e.target.value)} />
              </Field>
            </div>

            {form.role === "student" && (
              <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <GraduationCap className="h-4 w-4 text-primary" /> Student track details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Student ID">
                    <Input value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="ARE-000000" />
                  </Field>
                  <Field label="Program / Track of study">
                    <Input value={form.studentTrack} onChange={(e) => set("studentTrack", e.target.value)} placeholder="Allied Health — Phlebotomy Track" />
                  </Field>
                </div>
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={!!form.nameChangeDoc}
                    onCheckedChange={(v) => set("nameChangeDoc", v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">
                    My legal name has changed since enrollment — trigger name-change documentation review.
                  </span>
                </label>
                {form.nameChangeDoc && (
                  <div className="mt-4">
                    <Field label="Former name of record" required>
                      <Input value={form.formerName} onChange={(e) => set("formerName", e.target.value)} placeholder="Name as it appeared at enrollment" />
                    </Field>
                    <p className="mt-2 text-xs text-muted-foreground">
                      A court order, marriage certificate, or amended government ID will be requested by the Registrar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {form.role !== "student" && (
              <div className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Third-party disclosure requirements
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Records may not be released to a third party without a signed FERPA/HIPAA authorization from the record holder.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Verification ID / Case number" required>
                    <Input value={form.verificationId} onChange={(e) => set("verificationId", e.target.value)} placeholder="VER-2026-00815" />
                  </Field>
                  <Field label="Signed release form" required>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/60">
                      <Upload className="h-4 w-4 shrink-0" />
                      <span className="truncate">{form.releaseFormName || "Attach signed release (PDF)"}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            set("releaseFormName", f.name);
                            toast.success("Release form attached");
                          }
                        }}
                      />
                    </label>
                  </Field>
                </div>
              </div>
            )}
          </Section>
        )}

        {step === 2 && (
          <Section title="Document selection" desc="Fees are non-refundable once the Registrar begins fulfillment.">
            <div className="grid gap-3">
              {(Object.keys(PACKAGES) as DocPackage[]).map((key) => {
                const p = PACKAGES[key];
                const selected = form.pkg === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("pkg", key)}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-accent/60 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 shrink-0 text-primary" /> {p.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.blurb}</p>
                    </div>
                    <span className="shrink-0 text-lg font-bold">${p.price}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Remittance</p>
                  <p className="text-xs text-muted-foreground">
                    Payment may be remitted now or from the confirmation screen after submission.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={PACKAGES[form.pkg].paypal} target="_blank" rel="noopener noreferrer">
                    Pay ${PACKAGES[form.pkg].price}.00 <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-4">
                <Field label="PayPal transaction reference (optional)">
                  <Input value={form.paymentRef ?? ""} onChange={(e) => set("paymentRef", e.target.value)} placeholder="e.g. 8XY12345AB678901C" />
                </Field>
              </div>
            </div>
          </Section>
        )}

        {step === 3 && (
          <Section title="Dissemination method" desc="Select how the sealed records should be transmitted.">
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { key: "digital", Icon: Mail, title: "Digital Transfer", desc: "Secure email delivery, 3–5 business days." },
                { key: "usps", Icon: Truck, title: "USPS Registered Mail", desc: "Sealed envelope, return receipt requested." },
              ] as { key: Delivery; Icon: typeof Mail; title: string; desc: string }[]).map(
                ({ key, Icon, title, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("delivery", key)}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      form.delivery === key
                        ? "border-primary bg-accent/60 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                  </button>
                ),
              )}
            </div>

            {form.delivery === "digital" ? (
              <div className="mt-6">
                <Field label="Secure delivery email" required>
                  <Input type="email" value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} placeholder="registrar@recipient.edu" />
                </Field>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Street address" required>
                    <Input value={form.address1} onChange={(e) => set("address1", e.target.value)} placeholder="1200 Meridian Avenue" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Suite / Unit / Attn">
                    <Input value={form.address2} onChange={(e) => set("address2", e.target.value)} placeholder="Suite 410" />
                  </Field>
                </div>
                <Field label="City" required>
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
                <Field label="State / Province" required>
                  <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
                </Field>
                <Field label="ZIP / Postal code" required>
                  <Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
                </Field>
                <Field label="Country">
                  <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                </Field>
              </div>
            )}

            <div className="mt-4">
              <Field label="Notes for the Registrar">
                <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Terms of attendance, deadlines, or special handling instructions." />
              </Field>
            </div>
          </Section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit}>
              <ShieldCheck className="h-4 w-4" /> Submit request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
