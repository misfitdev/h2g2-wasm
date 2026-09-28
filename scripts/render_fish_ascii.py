#!/usr/bin/env python3
"""Render a source MP4 as faded, colored ASCII video with its original audio.

Requires ffmpeg, ffprobe, Pillow, and NumPy. The output is derivative movie
media: converting it does not grant distribution rights.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

GLYPHS = " .:-=+*#%@"
CELL_WIDTH = 4
CELL_HEIGHT = 8
FONT_SIZE = 7


def probe_video(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    stream = json.loads(result.stdout)["streams"][0]
    return int(stream["width"]), int(stream["height"])


def glyph_atlas(font_path: str) -> np.ndarray:
    font = ImageFont.truetype(font_path, FONT_SIZE)
    atlas = np.zeros((len(GLYPHS), CELL_HEIGHT, CELL_WIDTH), dtype=np.uint8)
    for index, glyph in enumerate(GLYPHS):
        tile = Image.new("L", (CELL_WIDTH, CELL_HEIGHT), 0)
        ImageDraw.Draw(tile).text((0, -1), glyph, fill=255, font=font)
        atlas[index] = np.asarray(tile)
    return atlas


def render_frame(pixels: np.ndarray, atlas: np.ndarray) -> np.ndarray:
    rows, columns, _ = pixels.shape
    luma = pixels @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    level = np.clip((luma - 16) / 220, 0, 1)
    glyphs = np.rint(level * (len(GLYPHS) - 1)).astype(np.uint8)
    mask = atlas[glyphs].transpose(0, 2, 1, 3).reshape(rows * CELL_HEIGHT, columns * CELL_WIDTH)

    # Keep source hues, but pull saturation and brightness down for faded film color.
    color = np.clip(20 + 0.8 * (0.65 * pixels + 0.35 * luma[..., None]), 0, 255).astype(np.uint8)
    colored_cells = np.repeat(np.repeat(color, CELL_HEIGHT, axis=0), CELL_WIDTH, axis=1)
    return ((colored_cells.astype(np.uint16) * mask[..., None].astype(np.uint16)) // 255).astype(np.uint8)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--font", default="/System/Library/Fonts/Menlo.ttc")
    parser.add_argument("--columns", type=int, default=480)
    parser.add_argument("--fps", type=int, default=12)
    parser.add_argument("--duration", type=float, help="Convert only the first N seconds for a preview")
    args = parser.parse_args()
    if args.columns < 1 or args.fps < 1:
        parser.error("columns and fps must be positive")
    source_width, source_height = probe_video(args.source)
    rows = max(1, round(args.columns * CELL_WIDTH * source_height / (CELL_HEIGHT * source_width)))
    frame_bytes = args.columns * rows * 3
    atlas = glyph_atlas(args.font)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_name(args.output.stem + ".tmp" + args.output.suffix)

    decoder = ["ffmpeg", "-v", "error", "-i", str(args.source)]
    if args.duration:
        decoder += ["-t", str(args.duration)]
    decoder += ["-vf", f"fps={args.fps},scale={args.columns}:{rows}:flags=area,format=rgb24", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"]
    encoder = [
        "ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{args.columns * CELL_WIDTH}x{rows * CELL_HEIGHT}", "-r", str(args.fps),
        "-i", "pipe:0", "-i", str(args.source), "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "libx264", "-preset", "medium", "-crf", "34", "-pix_fmt", "yuv420p",
        "-c:a", "copy", "-movflags", "+faststart", str(temporary),
    ]
    if args.duration:
        encoder.insert(-1, "-t")
        encoder.insert(-1, str(args.duration))

    decoded = subprocess.Popen(decoder, stdout=subprocess.PIPE)
    encoded = subprocess.Popen(encoder, stdin=subprocess.PIPE)
    frames = 0
    try:
        if decoded.stdout is None or encoded.stdin is None:
            raise RuntimeError("Could not open video pipes")
        while True:
            frame_data = decoded.stdout.read(frame_bytes)
            if not frame_data:
                break
            if len(frame_data) != frame_bytes:
                raise RuntimeError("Incomplete decoded frame")
            pixels = np.frombuffer(frame_data, dtype=np.uint8).reshape(rows, args.columns, 3)
            encoded.stdin.write(render_frame(pixels, atlas).tobytes())
            frames += 1
            if frames % (args.fps * 10) == 0:
                print(f"Rendered {frames // args.fps}s", file=sys.stderr, flush=True)
        encoded.stdin.close()
        decoded.stdout.close()
        if decoded.wait() != 0 or encoded.wait() != 0:
            raise RuntimeError("ffmpeg failed to decode or encode the video")
        temporary.replace(args.output)
        print(f"Wrote {args.output}: {frames} frames, {args.columns}x{rows} characters")
    finally:
        if decoded.poll() is None:
            decoded.kill()
        if encoded.poll() is None:
            encoded.kill()
        if temporary.exists():
            temporary.unlink()


if __name__ == "__main__":
    main()
