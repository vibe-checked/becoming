export const IMAGE_DURATION_MS = 4000;
export const CROSSFADE_MS = 1200;
export const AFFIRMATION_INTERVAL_MS = 15000;
export const AFFIRMATION_FADE_IN_MS = 800;
export const AFFIRMATION_HOLD_MS = 4000;
export const AFFIRMATION_FADE_OUT_MS = 800;
export const AFFIRMATION_TOTAL_MS =
  AFFIRMATION_FADE_IN_MS + AFFIRMATION_HOLD_MS + AFFIRMATION_FADE_OUT_MS;

export function computeImageState(
  elapsedMs: number,
  imageCount: number,
): {
  frontIndex: number;
  backIndex: number;
  crossfadeProgress: number;
  kenBurnsProgress: number;
} {
  const cycle = elapsedMs % (IMAGE_DURATION_MS * imageCount);
  const currentImageTime = cycle % IMAGE_DURATION_MS;
  const frontIndex = Math.floor(cycle / IMAGE_DURATION_MS) % imageCount;
  const backIndex = (frontIndex + 1) % imageCount;
  const kenBurnsProgress = currentImageTime / IMAGE_DURATION_MS;

  const timeUntilSwap = IMAGE_DURATION_MS - currentImageTime;
  let crossfadeProgress = 0;
  if (timeUntilSwap <= CROSSFADE_MS) {
    crossfadeProgress = 1 - timeUntilSwap / CROSSFADE_MS;
  }

  return { frontIndex, backIndex, crossfadeProgress, kenBurnsProgress };
}

export function computeAffirmationState(
  elapsedMs: number,
  affirmationCount: number,
): {
  visible: boolean;
  index: number;
  opacity: number;
} {
  if (elapsedMs < AFFIRMATION_INTERVAL_MS) {
    return { visible: false, index: 0, opacity: 0 };
  }

  const adjustedMs = elapsedMs - AFFIRMATION_INTERVAL_MS;
  const cycleIndex = Math.floor(adjustedMs / AFFIRMATION_INTERVAL_MS);
  const index = cycleIndex % affirmationCount;
  const posInCycle = adjustedMs % AFFIRMATION_INTERVAL_MS;

  if (posInCycle > AFFIRMATION_TOTAL_MS) {
    return { visible: false, index, opacity: 0 };
  }

  let opacity: number;
  if (posInCycle < AFFIRMATION_FADE_IN_MS) {
    opacity = posInCycle / AFFIRMATION_FADE_IN_MS;
  } else if (posInCycle < AFFIRMATION_FADE_IN_MS + AFFIRMATION_HOLD_MS) {
    opacity = 1;
  } else {
    const fadeOutElapsed = posInCycle - AFFIRMATION_FADE_IN_MS - AFFIRMATION_HOLD_MS;
    opacity = 1 - fadeOutElapsed / AFFIRMATION_FADE_OUT_MS;
  }

  return { visible: true, index, opacity: Math.max(0, Math.min(1, opacity)) };
}

export function isSessionComplete(elapsedMs: number, durationMs: number): boolean {
  return elapsedMs >= durationMs;
}
