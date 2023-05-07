import io
import numpy as np
from PIL import Image
from typing import List

import modal
from modal import Image as ModalImage, method, asgi_app
from pathlib import Path
import time
import os

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse

web_app = FastAPI()

stub = modal.Stub("image-fusion")

def download_models():
    from kandinsky2 import get_kandinsky2

    self.model = get_kandinsky2(
        "cuda",
        task_type="text2img",
        model_version="2.1",
        use_flash_attention=False,
    )
    
image = (
    modal.Image.from_dockerhub(
        "nvidia/cuda:11.7.0-devel-ubuntu20.04",
        setup_dockerfile_commands=[
            "ENV TZ=America",
            "ENV DEBIAN_FRONTEND=noninteractive",
            "RUN apt-get update",
            "RUN apt-get install -y python3 python3-pip python-is-python3",
        ],
    )
    .apt_install("git", "libgl1-mesa-glx", "libglib2.0-0")
    .pip_install(
        "accelerate",
        "git+https://github.com/ai-forever/Kandinsky-2.git", 
        "opencv-python",
        "git+https://github.com/openai/CLIP.git"
    )
    .pip_install("xformers", pre=True)
    .run_function(
        download_models,
    )
)
stub.image = image

def run_inference(
    images: List[Image.Image],
    weights: List[float],
    num_steps: int = 150,
    batch_size: int = 1,
    guidance_scale: float = 5,
    h: int = 768,
    w: int = 768,
    sampler: str = "p_sampler",
    prior_cf_scale: float = 4,
    prior_steps: str = "5",
) -> List[bytes]:
    import torch
    
    # Run inference
    with torch.no_grad():
        fused_images = self.model.mix_images(
            images,
            weights,
            num_steps=num_steps,
            batch_size=batch_size,
            guidance_scale=guidance_scale,
            sampler=sampler,
            prior_cf_scale=prior_cf_scale,
            prior_steps=prior_steps,
        )

    output_bytes_list = []
    for fused_image in fused_images:
        # Convert PIL Image to numpy array
        fused_image = np.array(fused_image)

        # Save fused image to bytes
        output_bytes = io.BytesIO()
        Image.fromarray(fused_image.astype(np.uint8)).save(output_bytes, format="PNG")
        output_bytes.seek(0)
        output_bytes_list.append(output_bytes)

    return output_bytes_list

@web_app.get("/")
def hello():
    return {"message": "Hello World"}

@web_app.post('/image-fuse')
def entrypoint(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    weights: str = "0.5, 0.5",
    num_steps: int = 150,
    batch_size: int = 1,
    guidance_scale: float = 5,
    h: int = 768,
    w: int = 768,
    sampler: str = "p_sampler",
    prior_cf_scale: float = 4,
    prior_steps: str = "5",
):
    dir = Path("/tmp/image-fusion")
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)
        
    weights_list = [float(w.strip()) for w in weights.split(",")]
    
    images = []
    for file in [image1, image2]:
        img = Image.open(file.file)
        images.append(img)
        
    print("IMAGES", images)
    print("WEIGHTS", weights_list)

    images_bytes = run_inference(
        images,
        weights_list,
        num_steps,
        batch_size,
        guidance_scale,
        h,
        w,
        sampler,
        prior_cf_scale,
        prior_steps,
    )

    for i, image_bytes in enumerate(images_bytes):
        output_path = dir / f"fused_image_{i}.png"
        print(f"Saving it to {output_path}")
        print(images_bytes)
        image_bytes = image_bytes.getvalue()
        with open(output_path, "wb") as f:
            f.write(image_bytes)
        
@stub.function(image=image, gpu="any")
@asgi_app()
def fastapi_app():
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return web_app
            
if __name__ == "__main__":
    stub.deploy("webapp")
