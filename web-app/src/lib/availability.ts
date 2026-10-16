const NEAR_RAITO = 0.3;

export type AvailabilityLebel = "full" | "near" | "open";

export type Availability = {
  isFull: boolean;
  level: AvailabilityLebel;
  percentFilled: number;
  label: string;
}

export function getAvailability(capacity:number, remaining: number):Availability {
  let safeRemaining = remaining;

  // マイナスの値が来ても0にする
  if (safeRemaining < 0) {
    safeRemaining = 0
  }
  // 定員を超えた値がきても定員に正す
  if (safeRemaining > capacity) {
    safeRemaining = capacity
  }

  const isFull = safeRemaining === 0;

  // バーの幅を計算
  let percentFilled = 0;
  if (capacity > 0 ) {
    percentFilled = ((capacity - safeRemaining) / capacity) * 100;
  }

  let level:AvailabilityLebel = "open";
  if (isFull) {
    level = "full";
  } else if (capacity > 0 && safeRemaining / capacity <= NEAR_RAITO){
    level = "near";
  }

  let label = "募集中";
  if (level === "full") {
    label = "満員";
  } else if (level === "near") {
    label = "残りわずか";
  }

  return {isFull, level, percentFilled, label};
}