export const CV_DAILY_PREPARATIONS = 2;

const storageKey = "convoca-cv-daily-preparations";
const limaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  dateStyle: "short",
});

export function remainingCvPreparations(storage: Storage, now = new Date()) {
  const day = limaDate.format(now);
  const saved = storage.getItem(storageKey);
  const [savedDay, savedCount] = (saved ?? "").split("|");
  const parsed = Number(savedCount);
  const count =
    savedDay === day && Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  return Math.max(0, CV_DAILY_PREPARATIONS - count);
}

export function reserveCvPreparation(storage: Storage, now = new Date()) {
  const remaining = remainingCvPreparations(storage, now);
  if (remaining === 0) return null;
  const used = CV_DAILY_PREPARATIONS - remaining + 1;
  storage.setItem(storageKey, `${limaDate.format(now)}|${used}`);
  return remaining - 1;
}
