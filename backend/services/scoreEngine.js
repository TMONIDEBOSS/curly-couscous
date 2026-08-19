// Each check contributes points toward the total score out of 100.
const WEIGHTS = {
  ssl: 25,
  headers: 25,
  malware: 25,
  blacklist: 15,
  eu: 10,
};

const STATUS_MULTIPLIER = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export function computeScore(checks) {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const status = checks[key]?.status || "fail";
    score += weight * STATUS_MULTIPLIER[status];
  }
  score = Math.round(score);

  let grade = "F";
  if (score >= 90) grade = "SECURE";
  else if (score >= 70) grade = "GOOD";
  else if (score >= 50) grade = "AT RISK";
  else grade = "CRITICAL";

  return { score, grade };
}
