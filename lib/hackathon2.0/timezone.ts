/**
 * Returns today's date in YYYY-MM-DD format in Arizona time (America/Phoenix).
 * Arizona does NOT observe daylight savings — it is always UTC-7.
 *
 * Use this instead of `new Date().toISOString().split("T")[0]` which returns UTC
 * and causes off-by-one day errors in the evening (e.g. 5pm MST = midnight UTC+1).
 */
export function todayArizona(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
  // en-CA locale gives YYYY-MM-DD format natively
}
