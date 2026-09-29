import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// true after hydration, false during the static prerender (portals need document).
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
