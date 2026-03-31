"use client";

import Link from "next/link";

type WeddingHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  /** Merged onto the title (e.g. serif + brand green for wedding venues) */
  titleClassName?: string;
};

export default function WeddingHeader({
  title,
  backHref = "/wedding",
  backLabel = "← Back",
  titleClassName,
}: WeddingHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-[var(--surface-border)]">
      <Link
        href={backHref}
        className="text-sm text-[var(--primary)] font-medium mb-3 inline-block"
      >
        {backLabel}
      </Link>
      <h1
        className={
          titleClassName?.trim()
            ? titleClassName
            : "text-2xl font-semibold text-[var(--text-primary)]"
        }
      >
        {title}
      </h1>
    </div>
  );
}
