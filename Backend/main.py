from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models

from routes.materials import router as materials_router
from routes.purchases import router as purchases_router
from routes.orders import router as orders_router



Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MVS Construction Estimation",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(materials_router)
app.include_router(purchases_router)
app.include_router(orders_router)

@app.get("/")
def home():
    return {
        "message": "MVS Construction Estimation API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }