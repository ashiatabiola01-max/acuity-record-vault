import { useState } from "react";
import { Search, PackageSearch, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./StatusBadge";
import { PACKAGES, ROLE_LABELS, formatDate, loadRequests, type VaultRequest } from "@/lib/vault";

const TIMELINE = ["Submitted", "Processing", "Fulfilled"] as const;

export function TrackRequest() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VaultRequest | null>(null);
  const [searched, setSearched] = useState(false);

  const search = () => {
    const id = query.trim().toUpperCase();
    const found = loadRequests().find((r) => r.id.toUpperCase() === id) ?? null;
    setResult(found);
    setSearched(true);
  };

  const stage = result ? TIMELINE.indexOf(result.status) : -1;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight">Track a request</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the Registry ID issued at submission (format ARV-YYYY-XXXX).
        </p>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="ARV-2026-1234"
            className="font-mono uppercase"
          />
          <Button onClick={search} className="shrink-0">
            <Search className="h-4 w-4" /> <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {searched && !result && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No record found for that Registry ID</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Verify the ID and try again, or contact the Office of Compliance.
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="font-mono text-lg font-bold">{result.id}</p>
              <p className="text-xs text-muted-foreground">Lodged {formatDate(result.createdAt)}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="mt-6 space-y-3">
            {TIMELINE.map((s, i) => (
              <div key={s} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <Circle
                    className={`h-4 w-4 shrink-0 ${i <= stage ? "fill-primary text-primary" : "text-border"}`}
                  />
                  {i < TIMELINE.length - 1 && (
                    <span className={`mt-1 h-8 w-px ${i < stage ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
                <div className="-mt-0.5 min-w-0">
                  <p className={`text-sm font-medium ${i <= stage ? "" : "text-muted-foreground"}`}>{s}</p>
                  <p className="text-xs text-muted-foreground">
                    {s === "Submitted"
                      ? "Request lodged and queued for compliance review."
                      : s === "Processing"
                        ? "Registrar is verifying authorization and assembling records."
                        : "Records released via the selected dissemination method."}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
            <Item label="Requestor" value={result.fullName} />
            <Item label="Profile" value={ROLE_LABELS[result.role]} />
            <Item label="Record subject" value={result.subjectName} />
            <Item label="Service" value={`${PACKAGES[result.pkg].label} — $${result.amount}.00`} />
            <Item
              label="Dissemination"
              value={result.delivery === "usps" ? "USPS Registered Mail" : "Digital Transfer (Secure Email)"}
            />
            <Item label="Contact" value={result.email} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}
