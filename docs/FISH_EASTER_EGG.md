# Dolphin departure Easter egg

Open `/?ee=fish` to watch a pre-rendered, faded-color ASCII version of the
movie clip. It uses 480 character columns and the original audio in one MP4,
so picture and sound stay synchronized. The Easter egg does not start the game
engine or change a saved game.

`apps/web/public/video/fish-ascii.mp4` is the only movie asset the app ships.
Git LFS stores it outside regular Git history. The Cloudflare build explicitly
hydrates the file, verifies that it is an MP4, and enforces Pages' 25 MiB asset
limit before building the site.
The unconverted `fish.mp4` is not part of the project or production build.
To regenerate the ASCII version from a source copy, run:

```sh
python3 -m pip install numpy pillow
python3 scripts/render_fish_ascii.py ~/Downloads/fish.mp4 apps/web/public/video/fish-ascii.mp4
```

The script also requires `ffmpeg` and `ffprobe`. It samples 480 columns at 12
frames per second, renders 4 x 8 pixel plain ASCII glyphs with subdued source
colors, encodes the 1920 x 800 raster at H.264 CRF 34, and muxes the source AAC
track into the new MP4. The default font is macOS Menlo; use `--font` to supply
a monospace TrueType font elsewhere. Converting media does not change its
licensing terms.

Click **Play** to start the clip and its audio, **Pause** to stop both, or
**Replay** to start over. Browsers require a click before audible playback.
**Escape to game** (or the Escape key) returns to the terminal. **Full size**
displays the 1920 x 800 pixel ASCII render at native size with scrolling;
**Fit view** scales it into the browser. A reduced-motion preference holds the
first ASCII frame still while audio can play.
