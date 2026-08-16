export default function Toast({ message, onDismiss }) {
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm text-gray-800 flex items-start gap-2">
      <span className="text-green-600">✓</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
