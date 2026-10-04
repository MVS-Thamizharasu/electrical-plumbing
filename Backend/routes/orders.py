import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Order


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


class OrderCreate(BaseModel):
    order_no: str
    order_type: str

    customer_name: str | None = None
    phone: str | None = None
    order_date: str | None = None

    items: list = []
    total_quantity: float = 0


@router.post("/")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    new_order = Order(
        order_no=order.order_no,
        order_type=order.order_type,
        customer_name=order.customer_name,
        phone=order.phone,
        order_date=order.order_date,
        items=json.dumps(order.items),
        total_quantity=order.total_quantity
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return {
        "id": new_order.id,
        "order_no": new_order.order_no,
        "order_type": new_order.order_type,
        "customer_name": new_order.customer_name,
        "phone": new_order.phone,
        "order_date": new_order.order_date,
        "items": json.loads(new_order.items or "[]"),
        "total_quantity": new_order.total_quantity
    }


@router.get("/")
def get_orders(
    db: Session = Depends(get_db)
):
    orders = db.query(Order).order_by(
        Order.id.desc()
    ).all()

    return [
        {
            "id": order.id,
            "order_no": order.order_no,
            "order_type": order.order_type,
            "customer_name": order.customer_name,
            "phone": order.phone,
            "order_date": order.order_date,
            "items": json.loads(order.items or "[]"),
            "total_quantity": order.total_quantity
        }
        for order in orders
    ]


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "id": order.id,
        "order_no": order.order_no,
        "order_type": order.order_type,
        "customer_name": order.customer_name,
        "phone": order.phone,
        "order_date": order.order_date,
        "items": json.loads(order.items or "[]"),
        "total_quantity": order.total_quantity
    }


@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Order deleted successfully"
    }
