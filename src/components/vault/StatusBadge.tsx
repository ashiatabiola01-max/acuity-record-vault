import type { RequestStatus } from "@/lib/vault";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

const map: Record<RequestStatus, { cls: string; Icon: typeof Clock }> = {
  Submitted: { cls: "border-warning/40 bg-warning/15 text-warning-foreground", Icon: Clock },
  Processing: { cls: "border-primary/30 bg-accent text-accent-foreground", Icon: Loader2 },
  Fulfilled: { cls: "border-success/40 bg-success/15 text-success", Icon: CheckCircle2 },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { cls, Icon } = map[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
