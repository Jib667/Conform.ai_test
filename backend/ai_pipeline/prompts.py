html_form_prompt = """
Analyze the PDF document provided in these images and create a complete HTML form that faithfully reproduces its structure and content. Please follow these specifications:

1. Generate valid, semantic HTML5 code for the entire form
2. Include all form fields, checkboxes, radio buttons, and text areas that appear in the document
3. Maintain the same section groupings, field labels, and overall organization as the original
4. Add appropriate input validation for all fields (required fields, date formats, numeric inputs, etc.)
5. Make the form accessible with proper ARIA attributes, label associations, and semantic HTML
6. Include responsive CSS styling that matches the general appearance of the original document
7. Add any necessary JavaScript for form validation and conditional logic if evident in the original
8. Ensure all dropdowns contain the same options as shown in the document
9. Include a submit button and any other action buttons present in the original
10. Add helpful comments in the code to explain the structure and any complex parts

{additional_instructions}

Please provide the complete HTML, CSS, and JavaScript code needed to implement this form as a single, ready-to-use file.
"""
