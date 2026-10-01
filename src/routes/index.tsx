import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileSignature, Search, ShieldCheck, Mail } from "lucide-react";
import logoAsset from "@/assets/logo-mark.png.asset.json";
import { RequestForm } from "@/components/vault/RequestForm";
import { TrackRequest } from "@/components/vault/TrackRequest";
import { AdminConsole } from "@/components/vault/AdminConsole";
import { INTAKE_EMAIL, REGISTRAR_EMAIL } from "@/lib/vault";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acuity Repository Vault — Academic Record Requests" },
      {
        name: "description",
        content:
          "Request, pay for, and track official transcripts and academic verifications from Acuity RISE Education Group's secure record fulfillment portal.",
      },
      { property: "og:title", content: "Acuity Repository Vault — Academic Record Requests" },
      {
        property: "og:description",
        content:
          "Secure academic record fulfillment and verification portal for students, employers, and institutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { key: "request", label: "Submit Request", Icon: FileSignature },
  { key: "track", label: "Track Request", Icon: Search },
  { key: "admin", label: "Admin Console", Icon: ShieldCheck },
] as const;

function Index() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("request");
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border" style={{ background: "var(--gradient-vault)" }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <div className="grid h-14 w-16 shrink-0 place-items-center rounded-md bg-card p-1">
              <img src={logoAsset.url} alt="Acuity RISE Education Group logo" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-primary-foreground sm:text-2xl">
                Acuity Repository Vault
              </h1>
              <p className="truncate text-xs text-primary-foreground/70 sm:text-sm">
                Acuity RISE Education Group · acuityriseeducation.solutions
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-primary-foreground/80">
            Official academic record fulfillment and verification. All disclosures are governed by FERPA
            and processed by the Office of Compliance &amp; Registrar Services.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors ${
                tab === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {tab === "request" && <RequestForm onSubmitted={bump} />}
        {tab === "track" && <TrackRequest key={version} />}
        {tab === "admin" && <AdminConsole version={version} onChange={bump} />}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-xs text-muted-foreground sm:grid-cols-2 sm:px-6">
          <div>
            <p className="font-semibold text-foreground">Acuity RISE Education Group</p>
            <p className="mt-1">Office of Compliance &amp; Registrar Services</p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="flex items-center gap-1.5 sm:justify-end">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {REGISTRAR_EMAIL}
            </p>
            <p className="flex items-center gap-1.5 sm:justify-end">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {INTAKE_EMAIL}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
