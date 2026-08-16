// Stitch editorial badge treatment: muted/10 tint, matching-tone border,
// small bold uppercase label — no filled/loud colors. COMPLETED is the one
// exception, rendered solid/filled so it's distinguishable from IN_PROGRESS
// (which shares the same forest-green hue, muted) by weight as well as
// color, per the "distinguishable through both typography/design and
// restrained semantic color" requirement.
const STATUS_STYLES = {
  OPEN: "bg-tertiary/10 text-tertiary border-tertiary/20",
  ACCEPTED: "bg-secondary/10 text-secondary border-secondary/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-primary text-on-primary border-primary",
  CANCELLED: "bg-error/10 text-error border-error/20",
};

const STATUS_LABELS = {
  OPEN: "OPEN",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.CANCELLED;
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center font-label-caps text-label-caps uppercase tracking-wide px-3 py-1 rounded-xl border ${style}`}
    >
      {label}
    </span>
  );
}
