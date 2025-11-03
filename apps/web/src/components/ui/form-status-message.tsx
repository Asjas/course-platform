interface IFormStatusMessage {
  statusMessage: string | null;
  serverError: string | undefined | null;
}

export default function FormStatusMessage({
  statusMessage,
  serverError,
}: IFormStatusMessage) {
  return (
    <div
      className="min-h-5 text-sm"
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
