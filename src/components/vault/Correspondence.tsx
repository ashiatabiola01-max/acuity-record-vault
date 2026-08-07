import { useState } from "react";
import { Copy, Check, Mail, Send } from "lucide-react";
import { buildTemplates } from "@/lib/templates";
import type { VaultRequest } from "@/lib/vault";
import { Button } from "@/components/ui/button";

export function Correspondence({ request }: { request: VaultRequest }) {
  const templates = buildTemplates(request);
  const [active, setActive] = useState(templates[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const tpl = templates.find((t) => t.id === active) ?? templates[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tpl.body);
      setCopied(tpl.id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              t.id === active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t.channel === "Email" ? <Mail className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
            {t.name}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-secondary/40">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tpl.channel} transmission · {request.id}
          </span>
          <Button size="sm" variant="outline" onClick={copy}>
            {copied === tpl.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === tpl.id ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-xs leading-relaxed text-foreground">
          {tpl.body}
        </pre>
      </div>
    </div>
  );
}
