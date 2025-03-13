import os
import logging
import re
import cv2
import numpy as np
import matplotlib.pyplot as plt
import torch
from transformers import pipeline
from PIL import Image

# Create directory for outputs
os.makedirs("Molmo_pts", exist_ok=True)

def read_image(path):
    # Read image using PIL instead of cv2 for better compatibility
    image_pil = Image.open(path)
    # Convert to numpy array for later processing
    image_np = np.array(image_pil)
    print(f"Image shape: {image_np.shape}")
    return image_pil, image_np

def get_coords(image_np, generated_text):
    h, w = image_np.shape[:2]

    if "</point" in generated_text:
        matches = re.findall(
            r'(?:x(?:\d*)="([\d.]+)"\s*y(?:\d*)="([\d.]+)")', generated_text
        )
        if matches:
            coordinates = [
                (int(float(x_val) / 100 * w), int(float(y_val) / 100 * h))
                for x_val, y_val in matches
            ]
        else:
            coordinates = []
            print("Matched pattern but no coordinates found")
    else:
        coordinates = []
        print("There are no points obtained from regex pattern")

    return coordinates

def overlay_points_on_image(image_np, points, radius=5, color=(255, 0, 0)):
    # Convert RGB to BGR for OpenCV
    image_cv = image_np[:, :, ::-1].copy() if len(image_np.shape) == 3 else image_np.copy()

    # Define the color for the points (BGR format)
    pink_color = (158, 89, 243)

    for (x, y) in points:
        # Draw an outline for the point
        cv2.circle(
            image_cv,
            (int(x), int(y)),
            radius=radius + 1,
            color=(255, 255, 255),
            thickness=2,
            lineType=cv2.LINE_AA
        )
        # Draw the point itself
        cv2.circle(
            image_cv,
            (int(x), int(y)),
            radius=radius,
            color=color,
            thickness=-1,
            lineType=cv2.LINE_AA
        )

    # Save and convert the image back to RGB
    cv2.imwrite("output_pt.jpg", image_cv)
    output_image = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)

    return output_image

if __name__ == '__main__':
    img_path = 'physicians-1.png'

    # Load image using PIL and convert to numpy array for visualization
    image_pil, image_np = read_image(img_path)

    # Create the pipeline
    pipe = pipeline("image-text-to-text",
                   model="allenai/MolmoE-1B-0924",
                   trust_remote_code=True,
                   device="cpu")  # Use "mps" for Apple Silicon if available

    # Format the query following Molmo's message format
    query_text = "Please identify all answer boxes or checkbox options in this form. For each answer box, place a point at the center of the box. Make sure to use <point> tags with x and y coordinates."

    messages = [
        {"role": "user", "content": [{"type": "text", "text": query_text},
                                    {"type": "image", "image": image_pil}]}
    ]

    # Generate response
    response = pipe(messages)

    # The response is typically a string or a list with the model's reply
    if isinstance(response, list) and len(response) > 0:
        generated_text = response[0]["content"] if isinstance(response[0], dict) else response[0]
    else:
        generated_text = response

    print("Generated response:", generated_text)

    # Extract coordinates from the response
    coordinates = get_coords(image_np, generated_text)
    print(f"Found {len(coordinates)} coordinates: {coordinates}")

    # Overlay points on the image
    if coordinates:
        result_img = overlay_points_on_image(image_np.copy(), coordinates)
        plt.figure(figsize=(12, 10))
        plt.imshow(result_img)
        plt.axis('off')
        plt.title('Detected Answer Boxes')
        plt.savefig("Molmo_pts/answer_boxes_detected.jpg")
        plt.show()
    else:
        print("No coordinates found to overlay on the image")
