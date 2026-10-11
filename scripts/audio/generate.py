"""
Generate the lesson audio: one mp3 per entry in scripts/audio/texts.json
(written by list-texts.ts), named <key>.mp3 in public/audio.

Setup (Python 3.13):
    pip install piper-tts lameenc

Run via `npm run audio:build`, or directly:
    python scripts/audio/generate.py [--voice-dir scripts/audio/voices]
                                     [--out public/audio] [--prune]

Existing files are skipped: keys are content hashes, so a file that exists is
by definition up to date. --prune deletes mp3s whose key is no longer listed.
"""

import argparse
import json
import sys
import urllib.request
from pathlib import Path

VOICE = "de_DE-thorsten-high"
VOICE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "de/de_DE/thorsten/high/"
)
TEXTS = Path(__file__).with_name("texts.json")


def download(url: str, dest: Path) -> None:
    def progress(blocks: int, block_size: int, total: int) -> None:
        if total > 0:
            pct = min(100, blocks * block_size * 100 // total)
            print(f"\r  {dest.name}: {pct}%", end="", flush=True)

    print(f"Downloading {url}")
    tmp = dest.with_suffix(dest.suffix + ".part")
    urllib.request.urlretrieve(url, tmp, progress)
    tmp.replace(dest)
    print()


def ensure_voice(voice_dir: Path) -> Path:
    voice_dir.mkdir(parents=True, exist_ok=True)
    model = voice_dir / f"{VOICE}.onnx"
    for path in (model, voice_dir / f"{VOICE}.onnx.json"):
        if not path.exists():
            download(VOICE_URL + path.name, path)
    return model


def load_voice(model_path: Path):
    from piper import PiperVoice  # piper-tts

    return PiperVoice.load(str(model_path))


def synthesize(voice, text: str) -> tuple[bytes, int]:
    """
    Text -> (16-bit mono PCM bytes, sample rate). The ONE place that touches
    piper's synthesis API; if a piper-tts release changes it, fix it here.

    piper-tts >= 1.3: voice.synthesize(text) yields AudioChunk objects with
    .audio_int16_bytes and .sample_rate. Older 1.2.x: voice.synthesize_stream_raw
    yields raw int16 bytes and the rate is voice.config.sample_rate.
    """
    if hasattr(voice, "synthesize_stream_raw"):
        pcm = b"".join(voice.synthesize_stream_raw(text))
        return pcm, voice.config.sample_rate
    chunks = list(voice.synthesize(text))
    pcm = b"".join(c.audio_int16_bytes for c in chunks)
    return pcm, chunks[0].sample_rate


def encode_mp3(pcm: bytes, sample_rate: int) -> bytes:
    import lameenc

    enc = lameenc.Encoder()
    enc.set_bit_rate(48)
    enc.set_in_sample_rate(sample_rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return bytes(enc.encode(pcm)) + bytes(enc.flush())


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate lesson audio with Piper.")
    ap.add_argument("--voice-dir", default="scripts/audio/voices")
    ap.add_argument("--out", default="public/audio")
    ap.add_argument("--prune", action="store_true")
    args = ap.parse_args()

    if not TEXTS.exists():
        print(f"{TEXTS} missing - run scripts/audio/list-texts.ts first")
        return 1
    entries = json.loads(TEXTS.read_text(encoding="utf-8"))
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    todo = [e for e in entries if not (out / f"{e['key']}.mp3").exists()]
    generated = 0
    if todo:
        voice = load_voice(ensure_voice(Path(args.voice_dir)))
        for i, e in enumerate(todo, 1):
            pcm, rate = synthesize(voice, e["text"])
            (out / f"{e['key']}.mp3").write_bytes(encode_mp3(pcm, rate))
            generated += 1
            print(f"\r  {i}/{len(todo)}", end="", flush=True)
        print()
    print(f"generated {generated}, skipped {len(entries) - generated}")

    if args.prune:
        keep = {e["key"] for e in entries}
        pruned = 0
        for f in out.glob("*.mp3"):
            if f.stem not in keep:
                f.unlink()
                pruned += 1
        print(f"pruned {pruned}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
