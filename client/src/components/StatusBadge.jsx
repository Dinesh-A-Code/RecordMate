const STATUS_STYLES = {
  OPEN: "bg-green-50 text-green-700 border-green-200",
  ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  COMPLETED: "bg-purple-50 text-purple-700 border-purple-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
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
    <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${style}`}>
      {label}
    </span>
  );
}
