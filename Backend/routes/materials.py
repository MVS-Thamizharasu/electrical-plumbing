from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Material

router = APIRouter(
    prefix="/api/materials",
    tags=["Materials"]
)


class MaterialCreate(BaseModel):
    category: str
    item_name: str
    size: str | None = None
    brand: str | None = None
    unit: str | None = None
    rate: float = 0


@router.post("/")
def create_material(
    material: MaterialCreate,
    db: Session = Depends(get_db)
):
    new_material = Material(
        category=material.category,
        item_name=material.item_name,
        size=material.size,
        brand=material.brand,
        unit=material.unit,
        rate=material.rate
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)

    return new_material


@router.get("/")
def get_materials(
    db: Session = Depends(get_db)
):
    return db.query(Material).all()


@router.get("/{material_id}")
def get_material(
    material_id: int,
    db: Session = Depends(get_db)
):
    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    return material


@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db)
):
    material = db.query(Material).filter(
        Material.id == material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    db.delete(material)
    db.commit()

    return {
        "message": "Material deleted successfully"
    }