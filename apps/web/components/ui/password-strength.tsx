"use client";

const COMMON_PASSWORDS = new Set([
  "password", "motdepasse", "123456", "12345678", "123456789", "azerty",
  "azertyuiop", "qwerty", "qwerty123", "iloveyou", "admin123", "abc123",
  "password1", "ivologis", "ivologis123", "bonjour", "soleil", "abidjan",
]);

type Score = 0 | 1 | 2;

const LEVELS: Record<Score, { label: string; textClass: string; barClass: string }> = {
  0: { label: "Faible", textClass: "text-danger", barClass: "bg-danger" },
  1: { label: "Moyen", textClass: "text-warning", barClass: "bg-warning" },
  2: { label: "Fort", textClass: "text-success", barClass: "bg-success" },
};

export function passwordStrength(password: string): { score: Score; label: string; textClass: string; barClass: string } {
  const pw = password ?? "";
  const lower = pw.toLowerCase();
  const isTrivial = COMMON_PASSWORDS.has(lower) || /^[0-9]+$/.test(pw) || /^(.)\1*$/.test(pw);

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  let score: Score;
  if (isTrivial || pw.length < 8 || variety <= 1) {
    score = 0;
  } else if (pw.length >= 12 && variety >= 3) {
    score = 2;
  } else {
    score = 1;
  }

  return { score, ...LEVELS[score] };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, textClass, barClass } = passwordStrength(password);
  const widthByScore: Record<Score, string> = { 0: "33%", 1: "66%", 2: "100%" };

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all duration-300 ${barClass}`} style={{ width: widthByScore[score] }} />
      </div>
      <p className={`mt-1 text-xs font-medium ${textClass}`}>Mot de passe {label.toLowerCase()}</p>
    </div>
  );
}
