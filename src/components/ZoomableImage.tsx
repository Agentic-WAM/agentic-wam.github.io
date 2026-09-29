"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/useIsClient";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
};

// A figure image that opens a full-screen lightbox when clicked (click anywhere
// outside / press Esc to close). The enlarged image grows out of the thumbnail's
// on-page position (FLIP-style) over a soft, fading backdrop — matching the
// dataset charts' enlarge animation. Used for every static figure on the page.
export default function ZoomableImage({ src, alt, width, height, className, style }: Props) {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const [shown, setShown] = useState(false); // drives the open/close transition
  const [from, setFrom] = useState({ dx: 0, dy: 0, s: 0.4 });

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(() => setOpen(false), 300);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const openLightbox = (rect: DOMRect) => {
    setFrom({
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
      s: Math.max(0.12, Math.min(0.8, rect.width / (window.innerWidth * 0.86))),
    });
    setOpen(true);
    setShown(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  return (
    <>
      <Image
        alt={alt}
        className={className}
        height={height}
        onClick={(e) => openLightbox(e.currentTarget.getBoundingClientRect())}
        src={src}
        style={{ cursor: "zoom-in", ...style }}
        unoptimized
        width={width}
      />
      {open && mounted
        ? createPortal(
            <div className="img-lightbox" data-open={shown ? "true" : undefined} onClick={close} role="presentation">
              <button className="img-lightbox__close" aria-label="Close" onClick={close} type="button">
                <X aria-hidden="true" size={22} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={alt}
                className="img-lightbox__img"
                onClick={(e) => e.stopPropagation()}
                src={src}
                style={{
                  transform: shown
                    ? "translate(0px, 0px) scale(1)"
                    : `translate(${from.dx}px, ${from.dy}px) scale(${from.s})`,
                  opacity: shown ? 1 : 0.5,
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
