from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), default="")
    role: Mapped[str] = mapped_column(String(30), default="member")
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Consumable(Base):
    __tablename__ = "consumables"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    category: Mapped[str] = mapped_column(String(80), default="")
    specification: Mapped[str] = mapped_column(String(160), default="")
    unit: Mapped[str] = mapped_column(String(40), default="件")
    quantity: Mapped[float] = mapped_column(Float, default=0)
    min_quantity: Mapped[float] = mapped_column(Float, default=0)
    location: Mapped[str] = mapped_column(String(160), default="")
    supplier: Mapped[str] = mapped_column(String(160), default="")
    remark: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    asset_no: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    model: Mapped[str] = mapped_column(String(120), default="")
    owner: Mapped[str] = mapped_column(String(100), default="")
    status: Mapped[str] = mapped_column(String(40), default="在用")
    location: Mapped[str] = mapped_column(String(160), default="")
    purchase_date: Mapped[str] = mapped_column(String(40), default="")
    price: Mapped[float] = mapped_column(Float, default=0)
    remark: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StockRecord(Base):
    __tablename__ = "stock_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_type: Mapped[str] = mapped_column(String(30), index=True)
    item_id: Mapped[int] = mapped_column(Integer, index=True)
    action: Mapped[str] = mapped_column(String(30), index=True)
    quantity: Mapped[float] = mapped_column(Float, default=0)
    operator_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    operator: Mapped[User] = relationship("User")
    borrower: Mapped[str] = mapped_column(String(100), default="")
    purpose: Mapped[str] = mapped_column(String(200), default="")
    remark: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
