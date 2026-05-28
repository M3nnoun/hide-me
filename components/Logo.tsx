/* Hide Me brand identity — censored eye mark */

export function LogoMark({ size = 36, color = "#f97316" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.75)}
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 18C2 18 9 5 24 5C39 5 46 18 46 18C46 18 39 31 24 31C9 31 2 18 2 18Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="18" r="7.5" stroke={color} strokeWidth="2.2" fill="none" />
      <rect x="13" y="15" width="22" height="6" rx="2.5" fill={color} />
    </svg>
  );
}

const CFG = {
  sm: { mark: 24, boxW: 42, boxH: 36, titleSize: "0.9375rem",  subSize: "0.5rem",    gap: "0.5rem"  },
  md: { mark: 32, boxW: 52, boxH: 44, titleSize: "1.125rem",   subSize: "0.5625rem", gap: "0.625rem"},
  lg: { mark: 44, boxW: 64, boxH: 56, titleSize: "1.625rem",   subSize: "0.625rem",  gap: "0.75rem" },
} as const;

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const c = CFG[size];

  return (
    <div
      aria-label="Hide Me"
      style={{
        display: "flex",
        alignItems: "center",
        gap: c.gap,
        userSelect: "none",
        textDecoration: "none",
      }}
    >
      {/* Logo mark box */}
      <div style={{
        width: c.boxW,
        height: c.boxH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.625rem",
        flexShrink: 0,
        background: "linear-gradient(135deg, rgba(249,115,22,0.16) 0%, rgba(234,88,12,0.08) 100%)",
        border: "1px solid rgba(249,115,22,0.28)",
      }}>
        <LogoMark size={c.mark} />
      </div>

      {/* Wordmark */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: "0.25rem" }}>
        <span style={{
          fontFamily: "var(--font-bricolage), system-ui, sans-serif",
          fontSize: c.titleSize,
          fontWeight: 800,
          color: "#fafafa",
          letterSpacing: "-0.01em",
        }}>
          Hide<span style={{ color: "#f97316" }}>Me</span>
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: c.subSize,
          color: "rgba(249,115,22,0.6)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
        }}>
          Face Anonymizer
        </span>
      </div>
    </div>
  );
}
