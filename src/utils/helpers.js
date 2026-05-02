// src/utils/helpers.js
// Misc utility functions used across the app.

/**
 * Deterministic HSL colour from a string (e.g. contributor name).
 * Produces vibrant, well-saturated colours that look good on dark backgrounds.
 */
export function hashColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 80%, 60%)`;
}

/**
 * Short date format, e.g. "Apr 12, 2025"
 */
export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Linear interpolation.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Convert an HSL css string to a hex string for Three.js materials.
 */
export function hslToHex(hslStr) {
  // Create a temporary element to resolve the CSS colour
  if (typeof document === "undefined") return "#ffffff";
  const el = document.createElement("div");
  el.style.color = hslStr;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);

  // computed is "rgb(r, g, b)"
  const match = computed.match(/\d+/g);
  if (!match || match.length < 3) return "#ffffff";
  const [r, g, b] = match.map(Number);
  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}
