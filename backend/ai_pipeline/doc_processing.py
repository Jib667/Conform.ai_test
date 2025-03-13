import os
import base64
import io
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from pdf2image import convert_from_bytes
from PIL import Image
from dotenv import load_dotenv
from prompts import html_form_prompt
load_dotenv()

# Initialize the OpenAI model with vision capabilities
llm = ChatOpenAI(
    model="gpt-4o",  # or "gpt-4o"
    api_key=os.getenv("OPENAI_API_KEY")

)

def generate_html_form_from_pdf(pdf_path: str, additional_instructions="") -> str:
    # Read the PDF file as bytes
    with open(pdf_path, "rb") as file:
        pdf_bytes = file.read()

    # Convert PDF bytes to images directly (no saving to disk)
    images = convert_from_bytes(pdf_bytes)

    # Format the prompt with any additional instructions
    formatted_prompt = html_form_prompt.format(
        additional_instructions=additional_instructions
    )

    # Prepare content list with the formatted text prompt
    content = [{"type": "text", "text": formatted_prompt}]

    # Add each page as an image
    for i, img in enumerate(images):
        # Convert PIL Image to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()

        # Encode as base64
        base64_img = base64.b64encode(img_byte_arr).decode('utf-8')

        # Add to content list
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{base64_img}",
                "detail": "high"
            }
        })

    # Create a message with the content
    message = HumanMessage(content=content)

    # Get response from the model
    response = llm.invoke([message])
    return response
# Example usage
pdf_path = "physicians.pdf"
question = ""

response = generate_html_form_from_pdf(pdf_path, question)
print(response.content)
