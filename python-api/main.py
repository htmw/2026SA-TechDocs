from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from recommender import load_recommender_data, recommend_food

app = FastAPI()

#recipe_df, tfidf = load_recommender_data()

class RecommendationRequest(BaseModel):
    hungerLevel: Optional[int] = 3
    craving: Optional[str] = ""
    mealType: Optional[str] = ""
    topN: Optional[int] = 3
    maxCalories: Optional[int] = None

class HungerRequest(BaseModel):
    hungerLevel: str
    topN: int = 5

@app.get("/")
def home():
    return {"message": "NutriAI FastAPI recommender is running"}

@app.post("/recommend")
def recommend(data: RecommendationRequest):
    recipe_df, tfidf = load_recommender_data()
    query_parts = []

    if data.craving:
        query_parts.append(data.craving)

    if data.mealType:
        query_parts.append(data.mealType)

    if data.hungerLevel is not None:
        if data.hungerLevel <= 2:
            query_parts.append("light snack")
        elif data.hungerLevel == 3:
            query_parts.append("meal")
        elif data.hungerLevel >= 4:
            query_parts.append("high protein meal")

    user_query = " ".join(query_parts).strip()

    if not user_query:
        user_query = "healthy meal"

    top_n = data.topN if data.topN else 3

    results_df = recommend_food(user_query, recipe_df, tfidf, top_n=top_n, max_calories=data.maxCalories)

    recommendations = results_df.to_dict(orient="records")

    return {
        "success": True,
        "input": data.model_dump(),
        "query_used": user_query,
        "recommendations": recommendations
    }

@app.post("/recommend-hunger")
def recommend_hunger(data: HungerRequest):
    recipe_df, tfidf = load_recommender_data()

    hunger = data.hungerLevel.lower().strip()

    if hunger == "little":
        user_query = "light"
    elif hunger == "hungry":
        user_query = "meal"
    elif hunger == "starving":
        user_query = "high protein"
    else:
        user_query = "meal"

    results_df = recommend_food(
        user_input=user_query,
        df=recipe_df,
        tfidf=tfidf,
        top_n=data.topN
    )

    return {
        "success": True,
        "hungerLevel": data.hungerLevel,
        "query_used": user_query,
        "recommendations": results_df.to_dict(orient="records")
    }
