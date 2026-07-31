import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reveal = useReveal<HTMLDivElement>();
  return (
    // @ts-expect-error polymorphic element
    <As ref={reveal.ref} data-visible={reveal["data-visible"]} className={cn("reveal", className)}>
      {children}
    </As>
  );
}
