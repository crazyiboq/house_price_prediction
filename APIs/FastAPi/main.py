
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import joblib
from pathlib import Path
from pydantic import BaseModel
import pandas as pd



app = FastAPI(
    title="Price prediction API Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



PROJECT_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_DIR / "models" / "model.pkl"

STATIC_DIR = Path(__file__).resolve().parent / "static"



FEATURES = ['Bedrooms', 'Bathrooms', 'Sqm', 'City']



if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

try:
    loaded = joblib.load(MODEL_PATH)

    if isinstance(loaded, dict) and 'pipeline' in loaded:

        BUNDLE = loaded
        PIPELINE = BUNDLE['pipeline']

        FEATURES = BUNDLE.get('feature_order', FEATURES)

    else:

        BUNDLE = None
        PIPELINE = loaded

    print("Model loaded successfully!")
    print(f"Model path: {MODEL_PATH}")
    print(f"Model type: {type(PIPELINE)}")
    print(f"Features: {FEATURES}")

except Exception as e:

    print(f"Model loading failed: {e}")
    raise


class HouseFeatures(BaseModel):
    Bedrooms: int
    Bathrooms: float
    Sqm: float
    City: str



@app.get("/")
async def home():

    return FileResponse(STATIC_DIR / "index.html")



@app.get("/hello/{name}")
async def hello(name: str):

    return {"message": f"Hello {name}"}



@app.post("/predict")
async def predict_price(house: HouseFeatures):

    try:

        input_data = house.model_dump()


        df = pd.DataFrame([input_data])


        df = df[FEATURES]


        prediction = PIPELINE.predict(df)

        return {
            "success": True,
            "predicted_price": float(prediction[0])
        }

    except Exception as e:

        raise HTTPException(    
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
