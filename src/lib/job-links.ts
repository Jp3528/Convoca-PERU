export function safeOfficialDocument(value: string) {
  try {
    const url = new URL(value);
    return url.origin === "https://www.investinperu.pe" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/wp-content\/uploads\/\d{4}\/\d{2}\/[^/]+\.(pdf|zip)$/i.test(
        url.pathname,
      )
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
