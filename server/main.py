from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from beanie import Document, init_beanie, PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import EmailStr, BaseModel
from typing import List, Optional
from fastapi.responses import JSONResponse
from fastapi import Form

import os

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Beanie Document Models
class tbl_district(Document):
    district_name: str

    class Settings:
        name = "tbl_district"

class tbl_place(Document):
    place_name: str
    district_id: PydanticObjectId  # Reference to tbl_district

    class Settings:
        name = "tbl_place"

class tbl_user(Document):
    full_name: str
    email: EmailStr
    password: str
    photo: str  # Store file path or URL
    place_id: PydanticObjectId  # Reference to tbl_place
    status: int = 0

    class Settings:
        name = "tbl_user"

# Pydantic models for request/response
class DistrictCreate(BaseModel):
    name: str

class DistrictUpdate(BaseModel):
    name: str

class PlaceCreate(BaseModel):
    place_name: str
    district_id: str

class PlaceUpdate(BaseModel):
    place_name: str
    district_id: str

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    place_id: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    place_id: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Initialize MongoDB and Beanie
@app.on_event("startup")
async def init_db():
    client = AsyncIOMotorClient("mongodb+srv://main:main@cluster0main.ztxrgoz.mongodb.net/")
    await init_beanie(database=client.db_react_fastapi, document_models=[tbl_district, tbl_place, tbl_user])

# ---------- DISTRICT ----------
@app.get("/district/")
async def get_districts():
    try:
        data = await tbl_district.find_all().to_list()
        return JSONResponse(content={"data": [{"id": str(d.id), "district_name": d.district_name} for d in data]})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving districts: {str(e)}")

@app.post("/district/")
async def district(payload: DistrictCreate):
    district = tbl_district(district_name=payload.name)
    await district.insert()
    data = await tbl_district.find_all().to_list()
    return JSONResponse(content={"data": [{"id": str(d.id), "district_name": d.district_name} for d in data]})

@app.delete("/district/{did}")
async def delete_district(did: str):
    try:
        district = await tbl_district.get(did)
        if not district:
            raise HTTPException(status_code=404, detail="District not found")
        await district.delete()
        data = await tbl_district.find_all().to_list()
        return JSONResponse(content={"data": [{"id": str(d.id), "district_name": d.district_name} for d in data]})
    except:
        raise HTTPException(status_code=400, detail="Invalid district ID")

@app.put("/district/{did}")
async def edit_district(did: str, district_data: DistrictUpdate):
    try:
        district = await tbl_district.get(did)
        if not district:
            raise HTTPException(status_code=404, detail="District not found")
        district.district_name = district_data.name
        await district.save()
        data = await tbl_district.find_all().to_list()
        return JSONResponse(content={"data": [{"id": str(d.id), "district_name": d.district_name} for d in data]})
    except:
        raise HTTPException(status_code=400, detail="Invalid district ID")

# ---------- PLACE ----------
@app.get("/place/")
async def get_places():
    try:
        data = await tbl_place.find_all().aggregate([
            {"$lookup": {
                "from": "tbl_district",
                "localField": "district_id",
                "foreignField": "_id",
                "as": "district"
            }},
            {"$unwind": "$district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "place_name": 1,
                "district_id": {"$toString": "$district_id"},
                "district_name": "$district.district_name"
            }}
        ]).to_list()
        return JSONResponse(content={"data": data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving places: {str(e)}")

@app.post("/place/")
async def place(payload: PlaceCreate):
    try:
        district = await tbl_district.get(payload.district_id)
        if not district:
            raise HTTPException(status_code=404, detail="District not found")
        place = tbl_place(place_name=payload.place_name, district_id=payload.district_id)
        print(place)
        await place.insert()
        data = await tbl_place.find_all().aggregate([
            {"$lookup": {
                "from": "tbl_district",
                "localField": "district_id",
                "foreignField": "_id",
                "as": "district"
            }},
            {"$unwind": "$district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "place_name": 1,
                "district_id": {"$toString": "$district_id"},
                "district_name": "$district.district_name"
            }}
        ]).to_list()
        return JSONResponse(content={"data": data})
    except:
        raise HTTPException(status_code=400, detail="Invalid district ID")

@app.delete("/place/{pid}")
async def delete_place(pid: str):
    try:
        place = await tbl_place.get(pid)
        if not place:
            raise HTTPException(status_code=404, detail="Place not found")
        await place.delete()
        data = await tbl_place.find_all().aggregate([
            {"$lookup": {
                "from": "tbl_district",
                "localField": "district_id",
                "foreignField": "_id",
                "as": "district"
            }},
            {"$unwind": "$district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "place_name": 1,
                "district_id": {"$toString": "$district_id"},
                "district_name": "$district.district_name"
            }}
        ]).to_list()
        return JSONResponse(content={"data": data})
    except:
        raise HTTPException(status_code=400, detail="Invalid place ID")

@app.put("/place/{pid}")
async def edit_place(pid: str, place_data: PlaceUpdate):
    try:
        place = await tbl_place.get(pid)
        if not place:
            raise HTTPException(status_code=404, detail="Place not found")
        district = await tbl_district.get(place_data.district_id)
        if not district:
            raise HTTPException(status_code=404, detail="District not found")
        place.place_name = place_data.place_name
        place.district_id = place_data.district_id
        await place.save()
        data = await tbl_place.find_all().aggregate([
            {"$lookup": {
                "from": "tbl_district",
                "localField": "district_id",
                "foreignField": "_id",
                "as": "district"
            }},
            {"$unwind": "$district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "place_name": 1,
                "district_id": {"$toString": "$district_id"},
                "district_name": "$district.district_name"
            }}
        ]).to_list()
        return JSONResponse(content={"data": data})
    except:
        raise HTTPException(status_code=400, detail="Invalid place ID or district ID")

# ---------- USER ----------
@app.post("/users/")
async def user(full_name: str, email: EmailStr, password: str, place_id: str, photo: UploadFile = File(...)):
    try:
        place = await tbl_place.get(place_id)
        if not place:
            raise HTTPException(status_code=404, detail="Place not found")
        photo_path = f"Assets/UserPhoto/{photo.filename}"
        os.makedirs("Assets/UserPhoto", exist_ok=True)
        with open(photo_path, "wb") as f:
            f.write(await photo.read())
        user = tbl_user(
            full_name=full_name,
            email=email,
            password=password,
            photo=photo_path,
            place_id=place_id,
            status=0
        )
        await user.insert() 
        return JSONResponse(content={"message": "User added successfully"})
    except:
        raise HTTPException(status_code=400, detail="Invalid place ID")

# ---------- GET ALL USERS ----------
@app.get("/users/")
async def get_users():
    try:
        data = await tbl_user.find_all().aggregate([
            {"$lookup": {
                "from": "tbl_place",
                "localField": "place_id",
                "foreignField": "_id",
                "as": "place"
            }},
            {"$unwind": "$place"},
            {"$lookup": {
                "from": "tbl_district",
                "localField": "place.district_id",
                "foreignField": "_id",
                "as": "place_district"
            }},
            {"$unwind": "$place_district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "full_name": 1,
                "email": 1,
                "photo": 1,
                "place_name": "$place.place_name",
                "place_id": {"$toString": "$place_id"},
                "district_name": "$place_district.district_name",
                "district_id": {"$toString": "$place.district_id"}
            }}
        ]).to_list()
        return JSONResponse(content={"data": data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

# ---------- USER SINGLE GET ----------
@app.get("/users/{uid}")
async def user_detail(uid: str):
    try:
        data = await tbl_user.find(tbl_user.id == PydanticObjectId(uid)).aggregate([
            {"$lookup": {
                "from": "tbl_place",
                "localField": "place_id",
                "foreignField": "_id",
                "as": "place"
            }},
            {"$unwind": "$place"},
            {"$lookup": {
                "from": "tbl_district",
                "localField": "place.district_id",
                "foreignField": "_id",
                "as": "place_district"
            }},
            {"$unwind": "$place_district"},
            {"$project": {
                "id": {"$toString": "$_id"},
                "full_name": 1,
                "email": 1,
                "photo": 1,
                "place_name": "$place.place_name",
                "place_id": {"$toString": "$place_id"},
                "district_name": "$place_district.district_name",
                "district_id": {"$toString": "$place.district_id"}
            }}
        ]).to_list()
        if not data:
            raise HTTPException(status_code=404, detail="User not found")
        return JSONResponse(content={"data": data[0]})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")

# ---------- LOGIN ----------
@app.post("/login")
async def login(login_data: LoginRequest):
    user = await tbl_user.find_one(tbl_user.email == login_data.email, tbl_user.password == login_data.password)
    if user:
        return JSONResponse(content={
            "role": "user",
            "id": str(user.id),
            "name": user.full_name,
            "message": "Login successful"
        })
    raise HTTPException(status_code=401, detail="Invalid email or password")

# ---------- USER UPDATE ----------
@app.put("/users/{uid}")
async def user_update(uid: str, user_data: UserUpdate):
    try:
        user = await tbl_user.get(uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user_data.place_id:
            place = await tbl_place.get(user_data.place_id)
            if not place:
                raise HTTPException(status_code=404, detail="Place not found")
            user.place_id = user_data.place_id
        if user_data.full_name:
            user.full_name = user_data.full_name
        if user_data.email:
            user.email = user_data.email
        await user.save()
        return JSONResponse(content={"message": "Updated"})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID or place ID")

# ---------- CHANGE PASSWORD ----------
@app.put("/users/{uid}/password")
async def user_password(uid: str, password_data: UserPasswordUpdate):
    try:
        user = await tbl_user.get(uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.password != password_data.old_password:
            raise HTTPException(status_code=400, detail="Old password is incorrect")
        user.password = password_data.new_password
        await user.save()
        return JSONResponse(content={"message": "Password changed successfully"})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")