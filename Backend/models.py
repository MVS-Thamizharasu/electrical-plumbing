from sqlalchemy import Column, Integer, String, Float
from database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    size = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    unit = Column(String, nullable=True)
    rate = Column(Float, default=0)


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)

    material_id = Column(Integer, nullable=False)

    item_name = Column(String, nullable=False)
    category = Column(String, nullable=False)

    size = Column(String, nullable=True)
    brand = Column(String, nullable=True)

    quantity = Column(Float, nullable=False, default=1)
    unit = Column(String, nullable=True)

    rate = Column(Float, nullable=False, default=0)
    amount = Column(Float, nullable=False, default=0)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    order_no = Column(String, nullable=False)
    order_type = Column(String, nullable=False)

    customer_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    order_date = Column(String, nullable=True)

    items = Column(String, nullable=True)
    total_quantity = Column(Float, default=0)