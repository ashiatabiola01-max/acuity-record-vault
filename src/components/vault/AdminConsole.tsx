import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  LogOut,
  Paperclip,
  Inbox,
  ChevronRight,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./StatusBadge";
import { Correspondence } from "./Correspondence";
import { toast } from "sonner";
import {
  PACKAGES,
  ROLE_LABELS,
  formatDate,
  loadRequests,
  saveRequests,
  type RequestStatus,
  type RequestorRole,
  type VaultRequest,
} from "@/lib/vault";

const ADMIN_PIN = "1234";
const NEXT: Record<RequestStatus, RequestStatus | null> = {
  Submitted: "Processing",
  Processing: "Fulfilled",
  Fulfilled: null,
};

export function AdminConsole({ version, onChange }: { version: number; onChange: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [rows, setRows] = useState<VaultRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<RequestorRole | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (authed) setRows(loadRequests());
  }, [authed, version]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (statusFilter === "all" || r.status === statusFilter) &&
          (roleFilter === "all" || r.role === roleFilter),
      ),
    [rows, statusFilter, roleFilter],
  );

  const persist = (list: VaultRequest[]) => {
    saveRequests(list);
    setRows(list);
    onChange();
  };

  const advance = (r: VaultRequest) => {
    const nx = NEXT[r.status];
    if (!nx) return;
    persist(rows.map((x) => (x.id === r.id ? { ...x, status: nx } : x)));
    toast.success(`${r.id} moved to ${nx}`);
  };

  const remove = (id: string) => {
    persist(rows.filter((x) => x.id !== id));
    setOpenId(null);
    toast.success(`${id} purged from the registry`);
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-center text-lg font-semibold tracking-tight">Admin Console</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Restricted to authorized Registrar personnel.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin === ADMIN_PIN) {
              setAuthed(true);
              setPin("");
            } else {
              toast.error("Incorrect access credential");
            }
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Access PIN
            </Label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="text-center font-mono tracking-[0.4em]"
            />
          </div>
          <Button type="submit" className="w-full">
            Unlock console
          </Button>
        </form>
      </div>
    );
  }

  const open = rows.find((r) => r.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">Service Request Tracker</h2>
          <p className="text-sm text-muted-foreground">{rows.length} record(s) in the registry</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAuthed(false)}>
          <LogOut className="h-4 w-4" /> Lock
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-card p-4">
        <FilterGroup
          label="Status"
          value={statusFilter}
          options={["all", "Submitted", "Processing", "Fulfilled"]}
          onChange={(v) => setStatusFilter(v as RequestStatus | "all")}
          render={(v) => (v === "all" ? "All" : v)}
        />
        <FilterGroup
          label="Profile"
          value={roleFilter}
          options={["all", "student", "employer", "institution"]}
          onChange={(v) => setRoleFilter(v as RequestorRole | "all")}
          render={(v) => (v === "all" ? "All" : ROLE_LABELS[v as RequestorRole])}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No requests match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Registry ID</th>
                  <th className="px-4 py-3 font-semibold">Requestor</th>
                  <th className="px-4 py-3 font-semibold">Profile</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-middle hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <button
                        className="font-mono text-xs font-semibold underline-offset-4 hover:underline"
                        onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      >
                        {r.id}
                      </button>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(r.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{ROLE_LABELS[r.role]}</td>
                    <td className="px-4 py-3 text-xs">
                      {PACKAGES[r.pkg].label}
                      <span className="block text-[11px] text-muted-foreground">
                        ${r.amount}.00 · {r.delivery === "usps" ? "USPS" : "Digital"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {NEXT[r.status] ? (
                        <Button size="sm" variant="outline" onClick={() => advance(r)}>
                          {NEXT[r.status]} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="font-mono text-base font-bold">{open.id}</p>
              <p className="text-xs text-muted-foreground">Case detail & correspondence suite</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove(open.id)}>
              <Trash2 className="h-4 w-4" /> Purge
            </Button>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Record subject" value={open.subjectName} />
            <Detail label="Subject DOB" value={open.subjectDob || "—"} />
            <Detail label="Department" value={open.department || "—"} />
            <Detail label="Phone" value={open.phone} />
            <Detail label="Student ID" value={open.studentId || "—"} />
            <Detail label="Track" value={open.studentTrack || "—"} />
            <Detail label="Former name" value={open.formerName || "—"} />
            <Detail label="Verification ID" value={open.verificationId || "—"} />
            <Detail label="Payment ref" value={open.paymentRef || "—"} />
            {open.delivery === "usps" && (
              <Detail
                label="Mailing address"
                value={[open.address1, open.address2, [open.city, open.state, open.postalCode].filter(Boolean).join(", "), open.country]
                  .filter(Boolean)
                  .join(" · ")}
              />
            )}
            {open.delivery === "digital" && <Detail label="Delivery email" value={open.recipientEmail || "—"} />}
            <Detail label="Notes" value={open.notes || "—"} />
          </dl>

          <div className="mt-5 rounded-lg border border-border bg-secondary/40 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Paperclip className="h-4 w-4 text-primary" /> Attachments & release forms
            </p>
            {open.releaseFormName ? (
              <p className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs">
                {open.releaseFormName}
                <span className="text-muted-foreground">· FERPA/HIPAA release on file</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {open.role === "student"
                  ? "Not required for self-requests."
                  : "No release form on file — records may not be disclosed."}
              </p>
            )}
            {open.nameChangeDoc && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-warning-foreground">
                <ChevronRight className="h-3.5 w-3.5" /> Name-change documentation review triggered.
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-4 text-sm font-semibold">Correspondence Suite</p>
            <Correspondence request={open} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  render: (v: string) => string;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              value === o
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}
