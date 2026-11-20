"""
Traitement vidéo en LECTURE SEULE pour KAIROS STUDIO.
Ne modifie, ne déplace et ne supprime jamais les fichiers originaux.
Génère :
  - public/media/video/hero-showreel.mp4 & .webm (boucle muette ~12s pour le Hero)
  - public/media/video/pub-nexora-tech.mp4 & .webm (film complet compressé pour le web)
  - scripts/.tmp-stills/*.png (images extraites pour conversion WebP/AVIF par process-media.mjs)
"""

import os
import subprocess
import sys
from pathlib import Path
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = Path(__file__).resolve().parent.parent
SRC_VIDEO = Path(r"D:\MON STUDIO\05_EXPORTATIONS\PUB_NEXORA_TECH_FINAL_FullHD_20261120.mp4")

VIDEO_OUT = ROOT / "public" / "media" / "video"
STILLS_TMP = ROOT / "scripts" / ".tmp-stills"

VIDEO_OUT.mkdir(parents=True, exist_ok=True)
STILLS_TMP.mkdir(parents=True, exist_ok=True)


def run(cmd: list[str], label: str) -> None:
    print(f"[VIDEO] {label}...")
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        print(proc.stderr[-1500:], file=sys.stderr)
        raise RuntimeError(f"FFmpeg failed on {label} (code {proc.returncode})")


def main() -> None:
    if not SRC_VIDEO.exists():
        raise FileNotFoundError(f"Source video introuvable (lecture seule): {SRC_VIDEO}")

    # 1. Extraire les stills HD (poster showreel, poster Nexora, 4 frames clés)
    stills = [
        ("hero-showreel-poster.png", "00:00:01.200"),
        ("pub-nexora-poster.png", "00:00:10.000"),
        ("nexora-still-01.png", "00:00:18.500"),
        ("nexora-still-02.png", "00:00:35.500"),
        ("nexora-still-03.png", "00:00:53.000"),
        ("nexora-still-04.png", "00:01:13.500"),
    ]
    for name, ts in stills:
        out = STILLS_TMP / name
        run(
            [
                FFMPEG, "-y",
                "-ss", ts,
                "-i", str(SRC_VIDEO),
                "-frames:v", "1",
                "-vf", "scale=1600:-2:flags=lanczos",
                str(out),
            ],
            f"Extraction still {name} @ {ts}",
        )

    # 2. Montage de la boucle Hero muette (~12s) à partir de 4 plans forts
    hero_filter = (
        "[0:v]trim=start=0.2:end=3.2,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,fps=24[v0];"
        "[0:v]trim=start=15.5:end=18.5,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,fps=24[v1];"
        "[0:v]trim=start=51.5:end=54.5,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,fps=24[v2];"
        "[0:v]trim=start=72.0:end=75.0,setpts=PTS-STARTPTS,scale=1280:720:flags=lanczos,fps=24[v3];"
        "[v0][v1][v2][v3]concat=n=4:v=1:a=0,format=yuv420p[vout]"
    )

    hero_mp4 = VIDEO_OUT / "hero-showreel.mp4"
    run(
        [
            FFMPEG, "-y",
            "-i", str(SRC_VIDEO),
            "-filter_complex", hero_filter,
            "-map", "[vout]",
            "-an",
            "-c:v", "libx264",
            "-profile:v", "main",
            "-crf", "26",
            "-preset", "medium",
            "-movflags", "+faststart",
            str(hero_mp4),
        ],
        "Encodage hero-showreel.mp4 (720p muet ~12s)",
    )

    hero_webm = VIDEO_OUT / "hero-showreel.webm"
    run(
        [
            FFMPEG, "-y",
            "-i", str(hero_mp4),
            "-an",
            "-c:v", "libvpx-vp9",
            "-crf", "35",
            "-b:v", "0",
            "-deadline", "good",
            "-cpu-used", "5",
            "-row-mt", "1",
            str(hero_webm),
        ],
        "Encodage hero-showreel.webm (VP9 muet ~12s)",
    )

    # 3. Compression du film complet Pub Nexora Tech pour le web (720p H.264 + AAC)
    nexora_mp4 = VIDEO_OUT / "pub-nexora-tech.mp4"
    run(
        [
            FFMPEG, "-y",
            "-i", str(SRC_VIDEO),
            "-vf", "scale=1280:720:flags=lanczos",
            "-c:v", "libx264",
            "-profile:v", "high",
            "-crf", "27",
            "-maxrate", "1300k",
            "-bufsize", "2600k",
            "-preset", "medium",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "128k",
            "-ac", "2",
            "-movflags", "+faststart",
            str(nexora_mp4),
        ],
        "Encodage pub-nexora-tech.mp4 (720p web optimisé)",
    )

    # 4. Version WebM légère (VP8 rapide + Opus) pour compatibilité multi-navigateurs
    nexora_webm = VIDEO_OUT / "pub-nexora-tech.webm"
    run(
        [
            FFMPEG, "-y",
            "-i", str(nexora_mp4),
            "-c:v", "libvpx",
            "-b:v", "950k",
            "-maxrate", "1200k",
            "-crf", "30",
            "-deadline", "good",
            "-cpu-used", "5",
            "-c:a", "libopus",
            "-b:a", "96k",
            str(nexora_webm),
        ],
        "Encodage pub-nexora-tech.webm (VP8/Opus web optimisé)",
    )

    # Résumé des tailles
    print("\n=== RÉSUMÉ DES VIDÉOS GÉNÉRÉES ===")
    for f in sorted(VIDEO_OUT.glob("*")):
        mb = f.stat().st_size / (1024 * 1024)
        print(f"  - {f.name}: {mb:.2f} Mo")


if __name__ == "__main__":
    main()
