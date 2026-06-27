import logoMark from "@/assets/logo-mark.png.asset.json";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoMark.url}
      alt="ClaimCompass logo"
      className={className ?? "h-9 w-9"}
      loading="eager"
      decoding="async"
    />
  );
}

export function Logo({
  className,
  markClassName,
  textClassName,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className={className ?? "flex items-center gap-2"}>
      <LogoMark className={markClassName ?? "h-9 w-9"} />
      <span
        className={textClassName ?? "text-lg font-semibold"}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ClaimCompass
      </span>
    </div>
  );
}