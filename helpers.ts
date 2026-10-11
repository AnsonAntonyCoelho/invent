// FUNCTIONS + SCOPE
import { ProductId } from "./types.js";

// Typed parameter, typed return value.
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Default parameter: if no percent is passed, it is treated as 0 (no discount).
export function calculateDiscountedPrice(price: number, percent: number = 0): number {
  const safePercent = Math.min(100, Math.max(0, percent));
  return Math.round(price * (1 - safePercent / 100) * 100) / 100;
}

// "101" becomes the number 101, "P-102" stays a string, "" means "not given".
export function parseProductId(raw: string): ProductId | undefined {
  const text = raw.trim();
  if (text === "") return undefined;
  return /^\d+$/.test(text) ? Number(text) : text;
}

// Turns "Gaming, Tech, gaming" into ["Gaming", "Tech"] (no blanks, no repeats).
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const piece of raw.split(",")) {
    const tag = piece.trim();
    const key = tag.toLowerCase(); // block scope: key only exists inside this loop
    if (tag !== "" && !seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

// SCOPE: a closure. "current" is hidden inside this function; the only way to
// read or change it is through the function that is returned.
export function createCounter(start: number = 1): () => number {
  let current = start;
  return function next(): number {
    const value = current;
    current += 1;
    return value;
  };
}
