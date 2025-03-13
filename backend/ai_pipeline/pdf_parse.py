from pypdf import PdfReader

def extract_pdf_form_fields(pdf_path):
    """
    Extracts form field names and their coordinates from a fillable PDF.

    Parameters:
    - pdf_path (str): The path to the PDF file.

    Returns:
    - List of tuples: [(page_number, field_name, [x1, y1, x2, y2]), ...]
    """
    reader = PdfReader(pdf_path)
    form_fields = []

    for page_num, page in enumerate(reader.pages):
        if "/Annots" in page:
            for annot in page["/Annots"]:
                annot_obj = annot.get_object()
                if "/T" in annot_obj:
                    field_name = annot_obj["/T"]
                    rect = annot_obj["/Rect"]
                    form_fields.append((page_num + 1, field_name, rect))
                    print(f"Page {page_num+1} - {field_name}: {rect}")

    return form_fields

# pdf_path = "sterilization.pdf"
fields = extract_pdf_form_fields('physicians.pdf')
print(fields)
