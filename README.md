# Document Auto-Fill Agent

This project provides an agent that automatically fills out relatable fields when a passport or other identity document is uploaded. It's designed to help automate the completion of forms like the USCIS G-28.

## Project Structure

- `backend/`: FastAPI server that uses OCR and MRZ parsing to extract data from documents.
- `frontend/`: React + Vite + Tailwind CSS application for uploading documents and viewing auto-filled forms.

## Getting Started

### Backend

1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart easyocr mrz pillow numpy
   ```
3. Run the server:
   ```bash
   python main.py
   ```
   The backend will start at `http://localhost:8000`.

### Frontend

1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at the URL provided by Vite (usually `http://localhost:5173`).

## How it Works

1. **Upload**: User uploads a passport image through the frontend.
2. **OCR**: The backend uses `easyocr` to extract text from the image.
3. **Parsing**: The backend looks for MRZ (Machine Readable Zone) data and parses it using the `mrz` library.
4. **Auto-Fill**: Extracted fields (First Name, Last Name, DOB, etc.) are sent back to the frontend and automatically populated in the form.
5. **Form Mapping**: The UI shows how this data maps directly to specific fields in the USCIS G-28 form.
