export const CV_DAILY_PREPARATIONS = 2;

const storageKey = "convoca-cv-daily-preparations";
const limaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  dateStyle: "short",
});

export function reserveCvPreparation(storage: Storage, now = new Date()) {
  const day = limaDate.format(now);
  const saved = storage.getItem(storageKey);
  const [savedDay, savedCount] = (saved ?? "").split("|");
  const parsed = Number(savedCount);
  const count =
    savedDay === day && Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  if (count >= CV_DAILY_PREPARATIONS) return null;
  const used = count + 1;
  storage.setItem(storageKey, `${day}|${used}`);
  return CV_DAILY_PREPARATIONS - used;
}
