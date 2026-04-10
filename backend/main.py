from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import easyocr
import PIL.Image
import io
import numpy as np
import re
import json
import fitz  # PyMuPDF
from mrz.checker.td3 import TD3CodeChecker

app = FastAPI()

class PassportData(BaseModel):
    firstName: Optional[str] = ""
    lastName: Optional[str] = ""
    dob: Optional[str] = ""
    nationality: Optional[str] = ""
    passportNumber: Optional[str] = ""
    gender: Optional[str] = ""
    expiryDate: Optional[str] = ""

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

reader = easyocr.Reader(['en'])

def parse_mrz(full_text):
    # Try to find two consecutive lines of 44 characters containing '<'
    lines = full_text.split('\n')
    mrz_lines = []
    for line in lines:
        cleaned_line = line.strip().replace(' ', '')
        if len(cleaned_line) >= 40 and '<' in cleaned_line:
            mrz_lines.append(cleaned_line)

    if len(mrz_lines) >= 2:
        # Check if they are likely MRZ lines
        for i in range(len(mrz_lines) - 1):
            line1 = mrz_lines[i]
            line2 = mrz_lines[i+1]
            if len(line1) == 44 and len(line2) == 44:
                try:
                    checker = TD3CodeChecker(line1 + '\n' + line2)
                    if checker:
                        fields = checker.fields()
                        return {
                            "firstName": fields.name,
                            "lastName": fields.surname,
                            "dob": fields.birth_date,
                            "nationality": fields.nationality,
                            "passportNumber": fields.document_number,
                            "gender": fields.sex,
                            "expiryDate": fields.expiry_date
                        }
                except:
                    continue
    return None

def extract_passport_data(text_results):
    full_text = "\n".join([res[1] for res in text_results])
    print(f"Extracted text:\n{full_text}")

    mrz_data = parse_mrz(full_text)
    if mrz_data:
        return mrz_data

    data = {
        "firstName": "",
        "lastName": "",
        "dob": "",
        "nationality": "",
        "passportNumber": "",
    }

    # Fallback to simple regex if MRZ parsing fails
    passport_match = re.search(r'[A-Z][0-9]{8}', full_text)
    if passport_match:
        data["passportNumber"] = passport_match.group(0)

    dob_match = re.search(r'(\d{2} [A-Z]{3} \d{4})', full_text)
    if dob_match:
        data["dob"] = dob_match.group(0)

    return data

@app.post("/process-passport", response_model=PassportData)
async def process_passport(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = PIL.Image.open(io.BytesIO(contents))
        image_np = np.array(image)

        results = reader.readtext(image_np)
        passport_data = extract_passport_data(results)

        return passport_data
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fill-pdf")
async def fill_pdf(
    template: UploadFile = File(...),
    data: str = Form(...)
):
    try:
        # Parse data
        form_values = json.loads(data)

        # Read PDF template
        contents = await template.read()
        doc = fitz.open(stream=io.BytesIO(contents), filetype="pdf")

        # Map our data to typical form field names (simplified)
        field_mapping = {
            "firstName": ["FirstName", "GivenName", "First Name"],
            "lastName": ["LastName", "FamilyName", "Last Name"],
            "dob": ["DOB", "DateOfBirth", "Date of Birth"],
            "nationality": ["Nationality", "Country", "Country of Birth"],
            "passportNumber": ["PassportNo", "PassportNumber", "Passport Number"]
        }

        for page in doc:
            for field in page.widgets():
                for key, value in form_values.items():
                    if key in field_mapping:
                        for possible_name in field_mapping[key]:
                            if possible_name.lower() in field.field_name.lower():
                                field.field_value = str(value)
                                field.update()

        output_stream = io.BytesIO()
        doc.save(output_stream)
        doc.close()
        output_stream.seek(0)

        return Response(
            content=output_stream.read(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=filled_form.pdf"}
        )
    except Exception as e:
        print(f"Error filling PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
