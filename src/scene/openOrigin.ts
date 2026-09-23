/**
 * Where a section was opened from, in viewport pixels.
 *
 * A sheet grows out of the thing you clicked — the bookshelf, the mug, a line
 * in the menu — and collapses back into it. That only works if the thing knows
 * where it was on screen at the moment it was pressed, so every control that
 * opens a section reports its own centre and it is carried down to the sheet.
 *
 * `null` means there was nothing to grow from: a deep link, a keyboard route
 * change, a browser Back. The sheet falls back to the middle of the screen,
 * which is the honest answer — it did not come from anywhere.
 */
export interface OpenOrigin {
  x: number;
  y: number;
}

/** The centre of an element, ready to hand to `open()`. */
export function originOf(el: Element | null | undefined): OpenOrigin | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
