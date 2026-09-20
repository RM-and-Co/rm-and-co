import type { CSSProperties } from "react";
import { logoSizes, type LogoId } from "./logo-data";

type LogoProps = { id: LogoId; alt: string; className?: string; priority?: boolean };

/**
 * Brand logo served from the artwork-trimmed derivatives in /brand/web (see scripts/build-web-logos.py).
 * Trimmed files carry no dead margin, so CSS sizes each logo from its aspect ratio (--ar) and a shared
 * visual area (--area), which gives wide wordmarks and stacked marks the same weight on the page.
 */
export default function Logo({ id, alt, className, priority = false }: LogoProps) {
  const { width, height } = logoSizes[id];
  return (
    // Static export cannot use the Next image optimiser; the derivatives are already pre-sized.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className ? `logo ${className}` : "logo"}
      src={`/brand/web/${id}.png`}
      alt={alt}
      width={width}
      height={height}
      style={{ "--ar": (width / height).toFixed(3) } as CSSProperties}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      data-opaque={id === "rm-risk" ? "" : undefined}
    />
  );
}
