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
 * Regenerate it by drawing `room-plate.webp` into a 48x27 canvas with
 * `ctx.filter = 'brightness(0.85) saturate(0.84)'` and taking
 * `toDataURL('image/webp', 0.85)`. Keep it under about 2 kB: it is inline, so
 * its weight is parse cost on every load.
 */
export const plateVeil =
  'data:image/webp;base64,UklGRhwDAABXRUJQVlA4WAoAAAAgAAAALwAAGgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggLgEAAHAHAJ0BKjAAGwA+SRyMRCKhoZqt/AAoBISxgFqNYErvAtlisnYcyT1JoMR/8fUXNPLXzOAXw6okM7KUH2NmPaLnPPC4AP7/D3316cxXvDCCu4s8tgOa99TKyoeDy/AtMxCHTXDbpdjSubYFowReQXOmxtGZlrHEGUvbDLY/ociSiLxFVc9JWb7DbT8YeiynYnkkmfkZWnuwqAXHuUKr04oD6OlkMEkxRRJCASaYCQPFdEySFcH7iXMDKauglJ4ekfbcWNU/ekM64SmJYqyqfHm6bK9HHutZhdt1KNjCf1OqLZh+RgQQqIzrKxpY4P3jTzzYe+mIaGfWpWfWDCgImDn4NU7ZixXNd9kDpi7xB9Pc5X+A0CQdVX/Hz3NUOkO5q0JjVXpEBm6P8BRkAAAA';
