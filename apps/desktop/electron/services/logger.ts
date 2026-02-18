const SENSITIVE_KEY_PATTERN = /(authorization|token|api[-_]?key|secret|cookie|session)/i;
const SENSITIVE_VALUE_PATTERN =
  /(sk-[a-zA-Z0-9_-]{10,}|Bearer\s+[a-zA-Z0-9._-]{10,}|api[_-]?key\s*[:=]\s*[a-zA-Z0-9._-]+)/gi;

export type LogLevel = "debug" | "info" | "warn" | "error";

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(SENSITIVE_VALUE_PATTERN, "[REDACTED]");
  }
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => {
        if (SENSITIVE_KEY_PATTERN.test(key)) return [key, "[REDACTED]"];
        return [key, redactValue(val)];
      })
    );
  }
  return value;
}

export function createLogger(debugEnabled = false) {
  return {
    log(level: LogLevel, message: string, payload?: unknown) {
      if (level === "debug" && !debugEnabled) return;
      const event = {
        timestamp: new Date().toISOString(),
        level,
        message,
        payload: payload === undefined ? undefined : redactValue(payload)
      };
      console.log(JSON.stringify(event));
    },
    debug(message: string, payload?: unknown) {
      this.log("debug", message, payload);
    },
    info(message: string, payload?: unknown) {
      this.log("info", message, payload);
    },
    warn(message: string, payload?: unknown) {
      this.log("warn", message, payload);
    },
    error(message: string, payload?: unknown) {
      this.log("error", message, payload);
    }
  };
}
