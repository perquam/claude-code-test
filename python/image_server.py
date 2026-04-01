import base64
import io
import os

import pixellab
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

secret = os.environ.get("PIXELAB_API_KEY", "")
client = pixellab.Client(secret=secret) if secret else None


def _generate_png(prompt: str) -> bytes:
    if client is None:
        raise HTTPException(status_code=500, detail="PIXELAB_API_KEY env var not set")

    response = client.generate_image_pixflux(
        description=prompt,
        image_size={"width": 256, "height": 256},
    )

    pil_image = response.image.pil_image()
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    return buf.getvalue()


class GenerateRequest(BaseModel):
    prompt: str


@app.post("/generate")
def generate(req: GenerateRequest):
    png_bytes = _generate_png(req.prompt)
    b64 = base64.b64encode(png_bytes).decode()
    return {"image": f"data:image/png;base64,{b64}"}


@app.get(
    "/preview",
    responses={200: {"content": {"image/png": {}}, "description": "Generated PNG image"}},
    response_class=Response,
)
def preview(prompt: str = Query(..., description="Text prompt for image generation")):
    png_bytes = _generate_png(prompt)
    return Response(content=png_bytes, media_type="image/png")
