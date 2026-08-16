// Reusable button foundation (Stitch "Buttons" pattern). Not yet wired
// into any existing page in this part — those are redesigned in a later
// Phase 8 part — but available now for that migration.
//
// Variants:
//   primary     solid forest green, for the main action on a screen
//   secondary   outlined, for a lower-emphasis alternative action
//   ghost       text-only, underlines on hover, for tertiary/nav-style actions
//   destructive muted red, for cancel/delete-style actions

const VARIANT_CLASSES = {
  primary:
    "bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary/40",
  secondary:
    "bg-transparent text-on-surface border border-outline hover:bg-surface-container-low focus-visible:ring-outline/40",
  ghost:
    "bg-transparent text-primary hover:underline decoration-primary/50 underline-offset-4 focus-visible:ring-primary/30",
  destructive:
    "bg-error/10 text-error border border-error/20 hover:bg-error/20 focus-visible:ring-error/40",
};

export default function Button({
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  children,
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`font-body-md text-body-md px-6 py-2 rounded-lg transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
