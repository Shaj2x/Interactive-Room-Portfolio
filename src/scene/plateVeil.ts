/**
 * The room, reduced to 48x27 pixels and pre-graded.
 *
 * While a section is open the room sits behind it as a soft, dark blur. Doing
 * that with `filter: blur(14px) brightness(...)` means the browser re-filters
 * the whole viewport on every frame the page composites — and with a game
 * running on top, that is every frame. Measured in a software-rasterising
 * browser it cost about 44 of the 60 frames per second available.
 *
 * So both the blur and the grade are baked instead of computed. This is the
 * painted plate drawn into a 48x27 canvas under `brightness(0.85)
 * saturate(0.84)`; stretched back across the viewport, the interpolation *is*
 * the blur. It costs one small texture on upload and nothing per frame.
 *
 * Regenerate it by drawing `room-plate.jpg` into a 48x27 canvas with
 * `ctx.filter = 'brightness(0.85) saturate(0.84)'` and taking
 * `toDataURL('image/webp', 0.85)`. Keep it under about 2 kB: it is inline, so
 * its weight is parse cost on every load.
 */
export const plateVeil =
  'data:image/webp;base64,UklGRhgDAABXRUJQVlA4WAoAAAAgAAAALwAAGgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggKgEAAFAHAJ0BKjAAGwA+SR6MRCKhoZqt/AAoBISxgFiPlIqHAlliUneEyUrGz/TzbkgwL3OL4p2xmuAaLmk8Ce4NzEVthRAA/v8PffXp0yhCKon3Z7RkMjpuVJfklWq2Hw+k0G/EPgElZkv50n44RsVEaFyTBvGtEg5esPDLL4iOOxzLZKXT7khWuetdST5N/FNJEkEUReKstoqWixbbGHsDm9TKv0aZzvtdmkKIptxb8znfY/lc2dTgodyckwFkfr3nzT+ehkZz2X0p7tclewvSbnf/7eC1QyvVzjAU4wRXAFQIiCH/aJl8L8mTsYdCIu6lGO6iSeBh9p6U4tZ6iYFSHQtVQi28ERV30x+Bt3p+q5XQ/GRhzMszqd3e2tea8A/QW4TYWkBiBSVYAAA=';
