const DEFAULT_AUTH_REDIRECT = "/home";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function getSafeAuthRedirect(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_AUTH_REDIRECT;
  }

  const candidate = value.trim();

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    CONTROL_CHARACTER_PATTERN.test(candidate)
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const base = new URL("https://helpme.invalid");

    const parsed = new URL(candidate, base);

    if (parsed.origin !== base.origin) {
      return DEFAULT_AUTH_REDIRECT;
    }

    const decodedPath = decodeURIComponent(parsed.pathname);

    if (decodedPath.startsWith("//") || decodedPath.includes("\\")) {
      return DEFAULT_AUTH_REDIRECT;
    }

    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}
