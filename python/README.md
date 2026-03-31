# Pixel Art Image Generator

Optional local server that generates pixel art room images via HuggingFace fal-ai.
When running, the game displays an AI-generated image at the top of each event card.
When not running, the game works exactly as normal — images are purely additive.

## Setup

```bash
cd python
pip install -r requirements.txt
```

Copy `.env` and add your token:
```bash
# edit .env
HF_TOKEN=hf_your_token_here
```

Get a token at https://huggingface.co/settings/tokens — needs Inference API access (free tier works).
The fal-ai provider also requires a fal.ai account linked to your HF account.

## Run

```bash
uvicorn image_server:app --port 5001
```

Then start the game normally in another terminal:
```bash
npm run dev
```

## How it works

- React calls `POST http://localhost:5001/generate` with a text prompt when an event room is entered
- The server calls `gokaygokay/Flux-2D-Game-Assets-LoRA` via HuggingFace fal-ai
- Returns a base64 PNG; the game caches it per room so revisits are instant
- Any error or timeout → no image shown, game unaffected

## Removing this feature

1. Delete this `python/` folder
2. In `src/components/room/EventCard.tsx`: remove the `generateRoomImage` import, the `useState`/`useEffect` lines, and the `<img>` block
3. Delete `src/services/imageGen.ts`
