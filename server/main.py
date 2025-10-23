# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session

engine = create_engine("mysql+pymysql://root:@127.0.0.1/fastapi_db", pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class District(Base):
    __tablename__ = "tbl_district"
    district_id   = Column(Integer, primary_key=True)
    district_name = Column(String(100))

class Place(Base):
    __tablename__ = "tbl_place"
    place_id      = Column(Integer, primary_key=True)
    place_name    = Column(String(100))
    district_id   = Column(Integer, ForeignKey("tbl_district.district_id"))

class User(Base):
    __tablename__ = "tbl_user"
    user_id       = Column(Integer, primary_key=True)
    user_name     = Column(String(100))
    user_email    = Column(String(255), unique=True)
    user_password = Column(String(255))
    place_id      = Column(Integer, ForeignKey("tbl_place.place_id"))

Base.metadata.create_all(bind=engine)
def get_db():  # dependency
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()


@app.get("/")
def home(): return "ok"

@app.post("/districts")
def add_district(name: str, db: Session = Depends(get_db)):
    d = District(district_name=name)
    db.add(d); db.commit(); db.refresh(d); return d

@app.post("/places")
def add_place(name: str, district_id: int, db: Session = Depends(get_db)):
    p = Place(place_name=name, district_id=district_id)
    db.add(p); db.commit(); db.refresh(p); return p

@app.post("/users")
def add_user(name: str, email: str, password: str, place_id: int, db: Session = Depends(get_db)):
    if db.query(User).filter_by(user_email=email).first():
        raise HTTPException(400, "email exists")
    u = User(user_name=name, user_email=email, user_password=password, place_id=place_id)
    db.add(u); db.commit(); db.refresh(u); return u

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()