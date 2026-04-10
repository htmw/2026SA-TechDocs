from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class RecommendationRequest(BaseModel):
    hungerLevel: Optional[int] = 3
    craving: Optional[str] = ""
    mealType: Optional[str] = ""
    topN: Optional[int] = 3

sample_recipes = [
    {
        "title": "Grilled Chicken Rice Bowl",
        "category": "lunch",
        "calories": 520,
        "protein": 38,
        "reason": "High protein balanced meal"
    },
    {
        "title": "Greek Yogurt Berry Parfait",
        "category": "snack",
        "calories": 240,
        "protein": 18,
        "reason": "Light option for mild hunger"
    },
    {
        "title": "Turkey Avocado Wrap",
        "category": "lunch",
        "calories": 430,
        "protein": 30,
        "reason": "Good for savory cravings"
    },
    {
        "title": "Veggie Omelet",
        "category": "breakfast",
        "calories": 310,
        "protein": 22,
        "reason": "High protein lower calorie choice"
    },
    {
        "title": "Salmon with Sweet Potato",
        "category": "dinner",
        "calories": 560,
        "protein": 40,
        "reason": "Balanced meal for strong hunger"
    }
]

@app.get("/")
def home():
    return {"message": "NutriAI FastAPI recommender is running"}

@app.post("/recommend")
def recommend(data: RecommendationRequest):
    results = sample_recipes.copy()

    if data.mealType:
        results = [
            recipe for recipe in results
            if data.mealType.lower() in recipe["category"].lower()
        ]

    if data.hungerLevel <= 2:
        results = sorted(results, key=lambda x: x["calories"])
    elif data.hungerLevel >= 4:
        results = sorted(results, key=lambda x: x["protein"], reverse=True)

    top_n = data.topN if data.topN else 3

    return {
        "success": True,
        "input": data.model_dump(),
        "recommendations": results[:top_n]
    }