interface ErrorWithMessage {
  message?: unknown;
}

interface ErrorWithDataCode {
  data?: {
    code?: unknown;
  };
}

interface ErrorWithShape {
  shape?: {
    message?: unknown;
    data?: {
      code?: unknown;
    };
  };
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const fromData = toNonEmptyString((error as ErrorWithDataCode).data?.code);
  if (fromData) {
    return fromData;
  }

  return toNonEmptyString((error as ErrorWithShape).shape?.data?.code);
}

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }

  const fromShape = toNonEmptyString((error as ErrorWithShape).shape?.message);
  if (fromShape) {
    return fromShape;
  }

  const fromMessage = toNonEmptyString((error as ErrorWithMessage).message);
  if (fromMessage) {
    return fromMessage;
  }

  return fallbackMessage;
}

export function isAccessDeniedError(error: unknown): boolean {
  const code = getErrorCode(error);

  if (code === "FORBIDDEN" || code === "UNAUTHORIZED") {
    return true;
  }

  const message = getBackendErrorMessage(error, "").toLowerCase();

  return (
    message.includes("forbidden") ||
    message.includes("unauthorized") ||
    message.includes("not authorized") ||
    message.includes("access denied") ||
    message.includes("permission")
  );
}
