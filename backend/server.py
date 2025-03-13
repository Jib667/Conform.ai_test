from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
from datetime import datetime
import re
import PyPDF2
import json

# Create the FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the uploads directory to make files accessible
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), "conform.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        healthcare_title TEXT NOT NULL,
        hospital_system TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create table for uploaded PDFs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS uploaded_pdfs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        is_fillable BOOLEAN NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create patients table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Add patient_id column to pdfs table if it doesn't exist
    cursor.execute("PRAGMA table_info(uploaded_pdfs)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]
    
    if 'patient_id' not in column_names:
        cursor.execute('''
        ALTER TABLE uploaded_pdfs ADD COLUMN patient_id INTEGER
        ''')
    
    conn.commit()
    cursor.close()
    print("Connected to the SQLite database")

# Call init_db at startup
init_db()

# Function to check if a PDF is fillable
def is_pdf_fillable(file_path):
    try:
        with open(file_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            # Check if the PDF has form fields
            fields = pdf.get_fields()
            # Return True if fields is not None and not empty
            return fields is not None and len(fields) > 0
    except Exception as e:
        print(f"Error checking if PDF is fillable: {e}")
        return False

# Function to get the next upload number for a user
def get_next_upload_number(db, user_id):
    cursor = db.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM uploaded_pdfs WHERE user_id = ?",
        (user_id,)
    )
    count = cursor.fetchone()[0]
    return count + 1

# Pydantic models
class UserSignup(BaseModel):
    name: str
    email: str
    healthcareTitle: str
    hospitalSystem: str

class UserLogin(BaseModel):
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    healthcareTitle: str
    hospitalSystem: str

# Routes
@app.post("/api/signup")
def signup(user: UserSignup, db: sqlite3.Connection = Depends(get_db)):
    if not all([user.name, user.email, user.healthcareTitle, user.hospitalSystem]):
        raise HTTPException(status_code=400, detail="All fields are required")
    
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, healthcare_title, hospital_system) VALUES (?, ?, ?, ?)",
            (user.name, user.email, user.healthcareTitle, user.hospitalSystem)
        )
        db.commit()
        user_id = cursor.lastrowid
        return {"message": "User registered successfully", "userId": user_id}
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
def login(user: UserLogin, db: sqlite3.Connection = Depends(get_db)):
    if not user.email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    cursor = db.cursor()
    cursor.execute(
        "SELECT id, name, email, healthcare_title, hospital_system FROM users WHERE email = ?",
        (user.email,)
    )
    
    db_user = cursor.fetchone()
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "message": "Login successful",
        "user": {
            "id": db_user[0],
            "name": db_user[1],
            "email": db_user[2],
            "healthcareTitle": db_user[3],
            "hospitalSystem": db_user[4]
        }
    }

@app.put("/api/users/{user_id}")
def update_user(
    user_id: int, 
    user_data: UserSignup, 
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        cursor.execute(
            """
            UPDATE users 
            SET name = ?, email = ?, healthcare_title = ?, hospital_system = ? 
            WHERE id = ?
            """,
            (
                user_data.name, 
                user_data.email, 
                user_data.healthcareTitle, 
                user_data.hospitalSystem, 
                user_id
            )
        )
        db.commit()
        
        # Get updated user data
        cursor.execute(
            "SELECT id, name, email, healthcare_title, hospital_system FROM users WHERE id = ?",
            (user_id,)
        )
        updated_user = cursor.fetchone()
        
        return {
            "message": "User updated successfully",
            "user": {
                "id": updated_user[0],
                "name": updated_user[1],
                "email": updated_user[2],
                "healthcareTitle": updated_user[3],
                "hospitalSystem": updated_user[4]
            }
        }
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to upload a PDF
@app.post("/api/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: int = Form(...),
):
    try:
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Verify the user exists
        cursor.execute("SELECT name FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's last name
        last_name = user[0].split()[-1] if len(user[0].split()) > 1 else user[0]
        
        # Check if the file is a PDF
        if not file.filename.lower().endswith('.pdf'):
            conn.close()
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Get the next upload number
        cursor.execute(
            "SELECT COUNT(*) FROM uploaded_pdfs WHERE user_id = ?",
            (user_id,)
        )
        count = cursor.fetchone()[0]
        upload_number = count + 1
        
        # Create the new filename
        new_filename = f"custom_upload{upload_number:03d}_{last_name}.pdf"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        
        print(f"Saving file to: {file_path}")
        
        # Read file content
        contents = await file.read()
        print(f"Read {len(contents)} bytes from uploaded file")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        
        print(f"File saved successfully to {file_path}")
        
        # Save the file information to the database
        cursor.execute(
            """
            INSERT INTO uploaded_pdfs (user_id, filename, original_filename, is_fillable)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, new_filename, file.filename, True)
        )
        conn.commit()
        print(f"Database record created for {new_filename}")
        
        # Get the uploaded PDF information
        cursor.execute(
            """
            SELECT id, filename, original_filename, upload_date
            FROM uploaded_pdfs
            WHERE user_id = ? AND filename = ?
            """,
            (user_id, new_filename)
        )
        pdf_info = cursor.fetchone()
        
        # Create a response dictionary
        response_data = {
            "message": "PDF uploaded successfully",
            "pdf": {
                "id": pdf_info[0],
                "filename": pdf_info[1],
                "originalFilename": pdf_info[2],
                "uploadDate": pdf_info[3],
                "url": f"/uploads/{new_filename}"
            }
        }
        
        # Close the database connection
        conn.close()
        
        return response_data
        
    except Exception as e:
        # If any error occurs, make sure to clean up
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        if 'conn' in locals():
            conn.close()
        print(f"Error during PDF upload: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Endpoint to get all uploaded PDFs for a user with patient information
@app.get("/api/user/{user_id}/pdfs")
def get_user_pdfs(user_id: int):
    try:
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Modified query to include patient information using LEFT JOIN
        cursor.execute(
            """
            SELECT p.id, p.filename, p.original_filename, p.upload_date, 
                   pat.id as patient_id, pat.name as patient_name
            FROM uploaded_pdfs p
            LEFT JOIN patients pat ON p.patient_id = pat.id
            WHERE p.user_id = ?
            ORDER BY p.upload_date DESC
            """,
            (user_id,)
        )
        
        pdfs = []
        for row in cursor.fetchall():
            pdf_data = {
                "id": row[0],
                "filename": row[1],
                "originalFilename": row[2],
                "uploadDate": row[3],
                "url": f"/uploads/{row[1]}"
            }
            
            # Add patient information if available
            if row[4]:  # If patient_id is not None
                pdf_data["patientId"] = row[4]
                pdf_data["patientName"] = row[5]
            
            pdfs.append(pdf_data)
        
        conn.close()
        return {"pdfs": pdfs}
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"Error fetching user PDFs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch PDFs: {str(e)}")

# Endpoint to delete a PDF
@app.delete("/api/pdfs/{pdf_id}")
def delete_pdf(pdf_id: int):
    try:
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get the PDF information before deleting
        cursor.execute(
            """
            SELECT filename, user_id
            FROM uploaded_pdfs
            WHERE id = ?
            """,
            (pdf_id,)
        )
        
        pdf_info = cursor.fetchone()
        if not pdf_info:
            conn.close()
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Get the file path
        file_path = os.path.join(UPLOAD_DIR, pdf_info['filename'])
        
        # Delete the file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        
        # Delete the database record
        cursor.execute(
            """
            DELETE FROM uploaded_pdfs
            WHERE id = ?
            """,
            (pdf_id,)
        )
        conn.commit()
        
        conn.close()
        return {"message": "PDF deleted successfully"}
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"Error deleting PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(e)}")

# Get patients for a user
@app.get("/api/user/{user_id}/patients")
def get_user_patients(user_id: int):
    try:
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, name FROM patients WHERE user_id = ?", 
            (user_id,)
        )
        
        patients = []
        for row in cursor.fetchall():
            patients.append({
                "id": row[0],
                "name": row[1]
            })
        
        conn.close()
        return {"patients": patients}
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"Error fetching patients: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch patients: {str(e)}")

# Add a new patient
@app.post("/api/patients")
async def add_patient(request: Request):
    try:
        # Get request body
        data = await request.json()
        user_id = data.get('user_id')
        name = data.get('name')
        
        if not user_id or not name:
            raise HTTPException(status_code=400, detail="User ID and name are required")
        
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO patients (name, user_id) VALUES (?, ?)",
            (name, user_id)
        )
        conn.commit()
        
        patient_id = cursor.lastrowid
        
        conn.close()
        
        return {
            "patient": {
                "id": patient_id,
                "name": name
            }
        }
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"Error adding patient: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add patient: {str(e)}")

# Assign a patient to a PDF
@app.post("/api/pdfs/{pdf_id}/patient")
async def assign_patient_to_pdf(pdf_id: int, request: Request):
    try:
        # Get request body
        data = await request.json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            raise HTTPException(status_code=400, detail="Patient ID is required")
        
        # Create a new database connection for this request
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE uploaded_pdfs SET patient_id = ? WHERE id = ?",
            (patient_id, pdf_id)
        )
        conn.commit()
        
        conn.close()
        
        return {"success": True}
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        print(f"Error assigning patient to PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to assign patient: {str(e)}")

# Run the server with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True) 