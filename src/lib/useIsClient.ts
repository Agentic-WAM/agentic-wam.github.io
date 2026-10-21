import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// true after hydration, false during the static prerender (portals need document).
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
