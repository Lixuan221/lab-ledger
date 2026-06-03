from datetime import datetime
from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = ""
    role: str = "member"
    password: str = Field(min_length=6)
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: str = ""
    role: str = "member"
    password: str | None = None
    is_active: bool = True


class ConsumableIn(BaseModel):
    name: str
    category: str = ""
    specification: str = ""
    unit: str = "件"
    quantity: float = 0
    min_quantity: float = 0
    location: str = ""
    supplier: str = ""
    remark: str = ""


class ConsumableOut(ConsumableIn):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True


class EquipmentIn(BaseModel):
    asset_no: str
    name: str
    model: str = ""
    owner: str = ""
    status: str = "在用"
    location: str = ""
    purchase_date: str = ""
    price: float = 0
    remark: str = ""


class EquipmentOut(EquipmentIn):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True


class StockAction(BaseModel):
    item_type: str
    item_id: int
    quantity: float = Field(gt=0)
    borrower: str = ""
    purpose: str = ""
    remark: str = ""


class RecordOut(BaseModel):
    id: int
    item_type: str
    item_id: int
    action: str
    quantity: float
    borrower: str
    purpose: str
    remark: str
    created_at: datetime
    operator: UserOut

    class Config:
        orm_mode = True


class SearchOut(BaseModel):
    consumables: list[ConsumableOut]
    equipment: list[EquipmentOut]


Token.update_forward_refs(UserOut=UserOut)
