export type ProviderErrorCode =
  | "auth"
  | "network"
  | "rate_limit"
  | "parse"
  | "unsupported"
  | "unknown";

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly retryable = false
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function toProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  if (error instanceof Error) return new ProviderError("unknown", error.message, false);
  return new ProviderError("unknown", "Unexpected provider error", false);
}
