/**
 * Feature flags for the HackASU platform.
 * NEXT_PUBLIC_CHECKIN_LOCKED=true   → disables check-in button for participants
 * NEXT_PUBLIC_SUBMISSION_LOCKED=true → disables submit button for participants
 */

export const CHECKIN_LOCKED =
  process.env.NEXT_PUBLIC_CHECKIN_LOCKED === "true";

export const SUBMISSION_LOCKED =
  process.env.NEXT_PUBLIC_SUBMISSION_LOCKED === "true";
