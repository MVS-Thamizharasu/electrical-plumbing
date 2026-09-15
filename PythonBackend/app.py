from pathlib import Path
import json

from fastapi import FastAPI, HTTPException

app = FastAPI(title="MVS Electrical Backend")

# Project root:
# MVS-Electrical-Plumbing/
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Shared data:
DATA_DIR = PROJECT_ROOT / "shared" / "data"


def load_json(filename: str):
    file_path = DATA_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Data file not found: {filename}",
        )

    try:
        with file_path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in {filename}: {error}",
        )


@app.get("/")
def home():
    return {
        "message": "MVS Electrical Backend is running"
    }


@app.get("/api/status")
def status():
    return {
        "status": "ok",
        "app": "MVS Electrical",
    }


@app.get("/api/electrical")
def electrical():
    return load_json("electrical.json")


@app.get("/api/plumbing")
def plumbing():
    return load_json("plumbing.json")


@app.get("/api/home-planning")
def home_planning():
    return load_json("home-planning.json")