import { useSyncExternalStore } from "react";

function subscribe(listener: () => void) {
  addEventListener("hashchange", listener);
  return () => removeEventListener("hashchange", listener);
}

// What the URL names after its #, without the #, as it changes.
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => location.hash.slice(1));
}
