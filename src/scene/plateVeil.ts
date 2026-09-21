/**
 * The room, reduced to 48x27 pixels and pre-graded.
 *
 * While a section is open the room sits behind it as a soft, dark blur. Doing
 * that with `filter: blur(14px) brightness(0.4)` means the browser re-filters
 * the whole viewport on every frame the page composites — and with a game
 * running on top, that is every frame. Measured in a software-rasterising
 * browser it cost about 44 of the 60 frames per second available.
 *
 * So both the blur and the grade are baked instead of computed. This is the
 * painted plate drawn into a 48x27 canvas under `brightness(0.4)
 * saturate(0.7)`; stretched back across the viewport, the interpolation *is*
 * the blur. It costs one small texture on upload and nothing per frame.
 *
 * Regenerate it by drawing `room-plate.webp` into a 48x27 canvas with
 * `ctx.filter = 'brightness(0.4) saturate(0.7)'` and taking
 * `toDataURL('image/webp', 0.85)`. Keep it under about 2 kB: it is inline, so
 * its weight is parse cost on every load.
 */
export const plateVeil =
  'data:image/webp;base64,UklGRnwCAABXRUJQVlA4WAoAAAAgAAAALwAAGgAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggjgAAAHAFAJ0BKjAAGwA+USCORKOiIZVVADgFBLOAYG4LNpQ203gNU4QreCb1PydxTW/mhYg3QAAA/v710FJLWWP9CNctBp32jQrt+QLEhOOItrN23xrg80pMx1s1Zi0jvf+i1lOsz0n5J+7VL88XI1180iqzde3tvw3vQLjPUeuY5NNM8kymlNEsARa2QiW1gAA=';
