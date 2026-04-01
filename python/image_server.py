import base64
import io
import os

import pixellab
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

secret = os.environ.get("PIXELLAB_SECRET", "")
client = pixellab.Client(secret=secret) if secret else None


class GenerateRequest(BaseModel):
    prompt: str


@app.post("/generate")
def generate(req: GenerateRequest):
    if client is None:
        raise HTTPException(status_code=500, detail="PIXELLAB_SECRET env var not set")

    response = client.generate_image_pixflux(
        description=req.prompt,
        image_size={"width": 256, "height": 256},
    )

    pil_image = response.image.pil_image()
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()

    return {"image": f"data:image/png;base64,{b64}"}
