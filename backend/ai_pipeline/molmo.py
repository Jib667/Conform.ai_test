import os
import logging
from datetime import datetime
import warnings

import cv2
import requests
import re
import numpy as np
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt

from transformers import (
   AutoModelForCausalLM,
   AutoProcessor,
   GenerationConfig,
   # BitsAndBytesConfig,
)
import torch

if torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")

os.makedirs("Molmo_pts", exist_ok=True)

def read_image(path):
   image = cv2.imread(path)
   print(image)
   rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
   return rgb_image


# quant_config = BitsAndBytesConfig(
#     load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=False
# )
def load_model(
    model_id: str, quant_config, dtype="auto", device="cuda"
):
    # Load the processor
    processor = AutoProcessor.from_pretrained(
        model_id, trust_remote_code=True, torch_dtype="auto", device_map=device
    )
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        trust_remote_code=True,
        torch_dtype=dtype,
        device_map=device,
        # quantization_config=quant_config,
    )
    return model, processor



def molmo_answer(query_text, input_img):

    inputs = processor.process(images=input_img, text=query_text)
    # Move inputs to the correct device and create a batch of size 1
    inputs = {k: v.to(model.device).unsqueeze(0) for k, v in inputs.items()}

    # Generate output; maximum 2048 new tokens; stop generation when <|endoftext|> is generated
    output = model.generate_from_batch(
        inputs,
        GenerationConfig(max_new_tokens=2048, stop_strings="<|endoftext|>"),
        tokenizer=processor.tokenizer,
    )

    # Only get generated tokens; decode them to text
    generated_tokens = output[0, inputs["input_ids"].size(1) :]
    generated_text = processor.tokenizer.decode(
        generated_tokens, skip_special_tokens=True
    )

    return generated_text

def get_coords(image, generated_text):
    h, w, _ = image.shape

    if "</point" in generated_text:
        matches = re.findall(
            r'(?:x(?:\d*)="([\d.]+)"\s*y(?:\d*)="([\d.]+)")', generated_text
        )
        if len(matches) > 1:
            coordinates = [
                (int(float(x_val) / 100 * w), int(float(y_val) / 100 * h))
                for x_val, y_val in matches
            ]
        else:
            coordinates = [
                (int(float(x_val) / 100 * w), int(float(y_val) / 100 * h))
                for x_val, y_val in matches
            ]

    else:
        print("There are no points obtained from regex pattern")

    return coordinates

def overlay_points_on_image(image, points, radius=5, color=(255, 0, 0)):

    # Define the BGR color equivalent of the hex color #f3599e
    pink_color = (158, 89, 243)  # Color for the points (BGR format)

    for (x, y) in points:
        # Draw an outline for the point
        outline = cv2.circle(
            image,
            (int(x), int(y)),
            radius=radius + 1,
            color=(255, 255, 255),
            thickness=2,
            lineType=cv2.LINE_AA
        )
        # Draw the point itself
        image_pt = cv2.circle(
            outline,
            (int(x), int(y)),
            radius=radius,
            color=color,
            thickness=-1,
            lineType=cv2.LINE_AA
        )

    # Save and convert the image
    sav_image = image_pt.copy()
    image = cv2.cvtColor(sav_image, cv2.COLOR_BGR2RGB)
    cv2.imwrite("output_pt.jpg", sav_image)

    return image

if __name__ == '__main__':
    img_path = 'physicians-1.png'

    model_id = "allenai/MolmoE-1B-0924"
    query_text = "Please identify all answer boxes or checkbox options in this form. For each answer box, place a point at the center of the box. Make sure to use <point> tags with x and y coordinates."
    image = read_image(img_path)

    model, processor = load_model(
        model_id, quant_config=None, dtype="auto", device=device
    )


    response = molmo_answer(query_text, image)
    coordinates = get_coords(image, response)

    result_img = overlay_points_on_image(image.copy(), coordinates)
    plt.figure(figsize=(12, 10))
    plt.imshow(result_img)
    plt.axis('off')
    plt.title('Detected Answer Boxes')
    plt.savefig("Molmo_pts/answer_boxes_detected.jpg")
    plt.show()
    print(response)
