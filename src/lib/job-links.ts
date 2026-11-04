export function safeOfficialDocument(value: string) {
  try {
    const url = new URL(value);
    const approvedPath =
      (url.origin === "https://www.investinperu.pe" &&
        /^\/wp-content\/uploads\/\d{4}\/\d{2}\/[^/]+\.(pdf|zip)$/i.test(
          url.pathname,
        )) ||
      (url.origin === "https://www.osiptel.gob.pe" &&
        /^\/media\/[a-z0-9]+\/[a-z0-9_.-]+\.pdf$/i.test(url.pathname));
    return approvedPath &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      !/%(?:2f|5c|00)/i.test(url.pathname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
