import { useSyncExternalStore } from "react";
import { getProgressSnapshot, subscribeToProgress } from "./progress";

export function useProgress() {
  return useSyncExternalStore(subscribeToProgress, getProgressSnapshot, getProgressSnapshot);
}

