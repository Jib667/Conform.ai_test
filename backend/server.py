from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import os
from datetime import datetime

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
    conn.commit()
    conn.close()
    print("Connected to the SQLite database")

# Call init_db at startup
init_db()

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

# Run the server with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True) 