"""Render the paper's figure PDFs (DexWAM/our-paper-arxiv/figures) to WebP for the website,
copy the skill key frames, and cut the three future frames used by the joint-denoising figure.

    python3 scripts/render_paper_figures.py          # needs ghostscript (gs), ImageMagick (magick), ffmpeg

Run scripts/export_task_episodes.py first: the denoising frames are cut from its Arrange Fruits video.
"""

import os
import subprocess
import tempfile

from pypdf import PdfReader

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPER = os.path.join(os.path.dirname(SITE), "our-paper-arxiv", "figures")
OUT = os.path.join(SITE, "public", "figures")

JOBS = [  # (source pdf, output name, target width in px)
    ("teaser_v5_0925.pdf", "teaser", 2800),
    ("method_v6_0926.pdf", "method", 2800),
    ("code_label_pipeline_v2_0926.pdf", "annotation_pipeline", 2400),
    ("hardware_setup/hardware_setup_yam.pdf", "hardware_yam", 1400),
    ("hardware_setup/hardware_setup_tianji_sharpa.pdf", "hardware_tianji_sharpa", 1700),
    ("appendix/failure_analysis.pdf", "failure_analysis", 2600),
    ("appendix/real_hybrid_progress.pdf", "hybrid_fold_towels", 2600),
    ("video_quality_comparison.pdf", "video_pred_arrange_fruits", 2600),
    ("video_quality_comparison_deal_poker.pdf", "video_pred_deal_poker", 2600),
    ("appendix/blocks_ranking_rgb_progress.pdf", "hybrid_blocks_ranking_rgb", 2600),
    ("appendix/pick_dual_bottles_progress.pdf", "hybrid_pick_dual_bottles", 2600),
] + [
    (f"keyframes_codegt/{t}.pdf", f"tasks/{t}", 2400)
    for t in ["arrange_fruits", "pack_backpack", "replace_lightbulb", "fold_and_stack_towels",
              "arrange_fruits_sharpa", "deal_poker", "flip_scoreboard", "solve_rubiks_cube"]
]


def run(*cmd):
    subprocess.run(cmd, check=True)


def main():
    os.makedirs(os.path.join(OUT, "tasks"), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for src, name, width in JOBS:
            pdf = os.path.join(PAPER, src)
            # The paper crops several figures with a CropBox, so render the CropBox, not the MediaBox.
            dpi = width / (float(PdfReader(pdf).pages[0].cropbox.width) / 72.0)
            png = os.path.join(tmp, "page.png")
            run("gs", "-q", "-dSAFER", "-dBATCH", "-dNOPAUSE", "-dUseCropBox", "-sDEVICE=png16m", f"-r{dpi:.2f}",
                "-dTextAlphaBits=4", "-dGraphicsAlphaBits=4", f"-sOutputFile={png}", pdf)
            run("magick", png, "-quality", "90", "-define", "webp:method=6", os.path.join(OUT, name + ".webp"))
            print("rendered", name)

    # Skill key frames (appendix skill visualizations): 5 per skill, in frame order.
    skills_src = os.path.join(PAPER, "skills")
    for skill in sorted(os.listdir(skills_src)):
        frames = sorted(f for f in os.listdir(os.path.join(skills_src, skill)) if f.endswith(".jpg"))
        os.makedirs(os.path.join(OUT, "skills", skill), exist_ok=True)
        for i, f in enumerate(frames):
            run("magick", os.path.join(skills_src, skill, f), "-resize", "480x480>", "-quality", "88",
                os.path.join(OUT, "skills", skill, f"{i}.webp"))
    print("copied skill frames")

    # Future frames for the joint-denoising figure (Arrange Fruits, left arm reaching into the bowl).
    video = os.path.join(SITE, "public", "videos", "episodes", "arrange_fruits.mp4")
    os.makedirs(os.path.join(OUT, "denoise"), exist_ok=True)
    for t in ["1.2", "2.0", "2.8"]:
        run("ffmpeg", "-v", "error", "-y", "-ss", t, "-i", video, "-frames:v", "1", "-vf", "scale=320:200", "-q:v", "3",
            os.path.join(OUT, "denoise", f"frame_{t}.jpg"))
    print("cut denoising frames")


if __name__ == "__main__":
    main()
