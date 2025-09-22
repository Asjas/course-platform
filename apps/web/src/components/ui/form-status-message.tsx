interface IFormStatusMessage {
  statusMessage: string | null;
  serverError: string | null;
}

export default function FormStatusMessage({
  statusMessage,
  serverError,
}: IFormStatusMessage) {
  return (
    <div
      className="min-h-[1.25rem] text-sm"
      role="status"
      aria-live="polite"
    >
      {statusMessage ? (
        <div className="text-green-600">{statusMessage}</div>
      ) : serverError ? (
        <div className="text-red-600">{serverError}</div>
      ) : null}
    </div>
  );
}
