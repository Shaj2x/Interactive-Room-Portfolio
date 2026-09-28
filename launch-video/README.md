# Launch video

A 19-second launch video for the room portfolio, built with
[Remotion](https://www.remotion.dev/) from the
[product-launch-video](https://github.com/EveryInc/product-launch-video) scaffold.

The finished file is `portfolio-launch.mp4` (1920x1080, 30fps, silent, captions
burned in).

All footage is the real site. `public/room.webm` is a recording of the live
room and `public/shots/` holds screenshots of its sections. The only text added
on top is the captions in `src/LaunchVideo.tsx`.

```bash
cd launch-video
npm install
npm run studio                                                  # live preview
npx remotion render LaunchVideo out/portfolio-launch.mp4        # render
```

If the site changes, re-record `public/room.webm` and re-take the screenshots,
then check the footage timestamps passed to `<Footage from={...}>`.
