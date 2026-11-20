"""
Compression en LECTURE SEULE des 3 vidéos de démonstration temporaires (Pexels License).
Stockées dans public/media/demo/ (supprimables en un clic côté admin/dépôt).
"""

import subprocess
import sys
from pathlib import Path
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = Path(__file__).resolve().parent.parent
DEMO_OUT = ROOT / "public" / "media" / "demo"
STILLS_TMP = ROOT / "scripts" / ".tmp-stills"
DEMO_OUT.mkdir(parents=True, exist_ok=True)
STILLS_TMP.mkdir(parents=True, exist_ok=True)

SOURCES = [
    (
        "demo-skyline",
        Path(r"D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Ville_Skyline_Coucher_Soleil_4K_30fps.mp4"),
        "00:00:02.000",
        10,
    ),
    (
        "demo-studio",
        Path(r"D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Corporate_Bureau_Equipe_Travail_4K_25fps.mp4"),
        "00:00:01.500",
        10,
    ),
    (
        "demo-motion",
        Path(r"D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Nature_Riviere_Ralenti_1080p_24fps.mp4"),
        "00:00:01.500",
        10,
    ),
]


def run(cmd: list[str], label: str) -> None:
    print(f"[DEMO VIDEO] {label}...")
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        print(proc.stderr[-1200:], file=sys.stderr)
        raise RuntimeError(f"FFmpeg failed: {label}")


def main() -> None:
    for slug, src, poster_ts, dur in SOURCES:
        if not src.exists():
            print(f"[WARN] Introuvable: {src}")
            continue

        poster = STILLS_TMP / f"{slug}-poster.png"
        run(
            [
                FFMPEG, "-y", "-ss", poster_ts, "-i", str(src),
                "-frames:v", "1", "-vf", "scale=1600:-2:flags=lanczos",
                str(poster),
            ],
            f"Poster {slug}",
        )

        mp4 = DEMO_OUT / f"{slug}.mp4"
        run(
            [
                FFMPEG, "-y", "-i", str(src), "-t", str(dur),
                "-vf", "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24",
                "-an", "-c:v", "libx264", "-profile:v", "main",
                "-crf", "26", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", str(mp4),
            ],
            f"MP4 {slug}",
        )

        webm = DEMO_OUT / f"{slug}.webm"
        run(
            [
                FFMPEG, "-y", "-i", str(mp4), "-an",
                "-c:v", "libvpx", "-b:v", "1100k", "-crf", "30",
                "-deadline", "good", "-cpu-used", "5", str(webm),
            ],
            f"WebM {slug}",
        )

    print("\n=== DEMO VIDEOS GENERATED ===")
    for f in sorted(DEMO_OUT.glob("*")):
        print(f"  - {f.name}: {f.stat().st_size / (1024 * 1024):.2f} Mo")


if __name__ == "__main__":
    main()
