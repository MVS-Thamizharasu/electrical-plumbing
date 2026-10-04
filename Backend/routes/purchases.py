from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Material, Purchase


router = APIRouter(
    prefix="/api/purchases",
    tags=["Purchases"]
)


class PurchaseCreate(BaseModel):
    material_id: int
    quantity: float
    rate: float


@router.post("/")
def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db)
):
    material = db.query(Material).filter(
        Material.id == purchase.material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Material not found"
        )

    amount = purchase.quantity * purchase.rate

    new_purchase = Purchase(
        material_id=material.id,
        item_name=material.item_name,
        category=material.category,
        size=material.size,
        brand=material.brand,
        quantity=purchase.quantity,
        unit=material.unit,
        rate=purchase.rate,
        amount=amount
    )

    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)

    return new_purchase


@router.get("/")
def get_purchases(
    db: Session = Depends(get_db)
):
    return db.query(Purchase).all()


@router.get("/{purchase_id}")
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db)
):
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id
    ).first()

    if not purchase:
        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    return purchase


@router.delete("/{purchase_id}")
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db)
):
    purchase = db.query(Purchase).filter(
        Purchase.id == purchase_id
    ).first()

    if not purchase:
        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    db.delete(purchase)
    db.commit()

    return {
        "message": "Purchase deleted successfully"
    }