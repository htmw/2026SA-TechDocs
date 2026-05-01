#Import Python libraries
from pathlib import Path
import pandas as pd
import numpy as np

import ast
import re

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

#Function to load the dataset
def load_recommender_data():
    base_dir = Path(__file__).resolve().parent
    csv_path = base_dir / "recipe_with_directions.csv"

    merged_df = pd.read_csv(csv_path)

    recipe_df = prepare_recipe_data(merged_df)
    recipe_df = add_recipe_type(recipe_df)
    tfidf = build_vectorizer(recipe_df)

    return recipe_df, tfidf

#merged_df = pd.read_csv(csv_path)
#print(merged_df.head())

#Keyword list
SWEET_KEYWORDS = [
    "cake","cookie","dessert","chocolate",
    "fruit","pie","ice cream","sweet"
]

SAVORY_KEYWORDS = [
    "beef","chicken","pork","cheese",
    "bacon","ham","turkey","savory"
]

SAUCE_KEYWORDS = [
    "sauce","dressing","dip","marinade",
    "gravy","glaze","frosting","icing","spread"
]

DRINK_KEYWORDS = [
    "drink","beverage","juice","smoothie",
    "shake","cocktail","tea","coffee"
]

DESSERT_KEYWORDS = [
    "cake","cookie","brownie","dessert",
    "pie","ice cream","pudding","muffin","cupcake"
]

SNACK_KEYWORDS = [
    "snack","bar","chips","cracker","bite"
]

MEAL_KEYWORDS = [
    "salad","sandwich","wrap","bowl","pasta",
    "soup","stew","curry","burger","taco",
    "chicken","beef","pork","turkey","rice"
]

# Function for cleaning input text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[\[\]'\",]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# Function to parse ingredients for frontend output
def parse_ingredients(ingredients_str):
    text = str(ingredients_str).strip()
    text = text.replace("[", "").replace("]", "").replace("'", "").replace('"', "")

    parts = re.split(
        r"\s+(?=(?:\d+/\d+|\d+\s+\d+/\d+|\d+)\s+[A-Za-z])",
        text
    )

    cleaned = []

    for item in parts:
        item = item.strip(" ,")
        if not item:
            continue

        # Merge open parentheses like "(5 to 6 tablespoons)"
        if cleaned and cleaned[-1].count("(") > cleaned[-1].count(")"):
            cleaned[-1] += " " + item
            continue

        # Merge ranges like "4 to 5 cups"
        if cleaned and cleaned[-1].strip().endswith("to"):
            cleaned[-1] += " " + item
            continue

        # Merge mixed numbers like "1" + "1/2 cups"
        if cleaned and re.fullmatch(r"\d+", cleaned[-1]) and re.match(r"^\d+/\d+\s+", item):
            cleaned[-1] += " " + item
            continue

        cleaned.append(item)

    return cleaned

# Function to parse directions for frontend output
def parse_directions(directions_str):
    try:
        parsed = ast.literal_eval(directions_str)

        if isinstance(parsed, list):
            cleaned = []

            for step in parsed:
                step = str(step).strip()

                # Remove numbering like "1. " or "2) "
                step = re.sub(r"^\d+[\.\)]\s*", "", step)

                if step:
                    cleaned.append(step)

            return cleaned

    except:
        pass

    text = str(directions_str).strip()
    text = text.replace("[", "").replace("]", "").replace("'", "").replace('"', "")

    parts = re.split(r"(?<=[.!?])\s+", text)

    cleaned = []

    for step in parts:
        step = step.strip()
        step = re.sub(r"^\d+[\.\)]\s*", "", step)

        if step:
            cleaned.append(step)

    return cleaned

#Function to prepare recipe dataset
def prepare_recipe_data(merged_df):
    df = merged_df[
        ["title","categories","ingredients","directions","calories","protein","fat","sodium"]
    ].copy()

    for col in ["title","categories","ingredients"]:
        df[col] = df[col].apply(clean_text)

    df["search_text"] = (
        df["title"] + " " +
        df["title"] + " " +
        df["title"] + " " +
        df["categories"] + " " +
        df["ingredients"]
    )
    return df

#Function to classify reipes
def classify_recipe_type(row):
    text = f"{row['title']} {row['categories']} {row['ingredients']}".lower()

    calories = row["calories"] if pd.notna(row["calories"]) else 0
    protein = row["protein"] if pd.notna(row["protein"]) else 0

    # sauces first
    if any(word in text for word in SAUCE_KEYWORDS):
        return "sauce"

    # drinks
    if any(word in text for word in DRINK_KEYWORDS):
        return "drink"

    # desserts
    if any(word in text for word in DESSERT_KEYWORDS):
        return "dessert"

    # snacks
    if any(word in text for word in SNACK_KEYWORDS):
        return "snack"

    # meals by keyword or nutrition
    if any(word in text for word in MEAL_KEYWORDS):
        return "meal"

    if calories >= 250 and protein >= 10:
        return "meal"

    if 100 <= calories < 250:
        return "snack"

    return "other"

#Function to apply recipe classification
def add_recipe_type(df):
    df["recipe_type"] = df.apply(classify_recipe_type, axis=1)
    return df

#Function to build Vectorizer
def build_vectorizer(df):
    tfidf = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1,2),
        max_features=5000
    )
    tfidf.fit(df["search_text"].fillna(""))
    return tfidf
    #tfidf_matrix = tfidf.fit_transform(df["search_text"])
    #return tfidf, tfidf_matrix

#Funtion to filter recipes
def filter_recipes(df, query, top_n=5):
    filtered_df = df.copy()
    query = query.lower().strip()

    # NEW: filter by intent
    if "hungry" in query or "meal" in query:
        filtered_df = filtered_df[filtered_df["recipe_type"] == "meal"]

    if "snack" in query:
        filtered_df = filtered_df[filtered_df["recipe_type"] == "snack"]

    if "sweet" in query:
        filtered_df = filtered_df[
            filtered_df["recipe_type"].isin(["dessert","snack"])
        ]

    if "drink" in query:
        filtered_df = filtered_df[filtered_df["recipe_type"] == "drink"]

    if "light" in query:
        filtered_df = filtered_df[
            (filtered_df["calories"] <= 500) &
            (filtered_df["calories"] >= 200) &
            (filtered_df["recipe_type"] == "meal")
        ]

    if "high protein" in query or "protein" in query:
        filtered_df = filtered_df[filtered_df["protein"] >= 20]

    # fallback
    if filtered_df.shape[0] < top_n:
        filtered_df = df.copy()

    return filtered_df

#Recommender
def recommend_food(user_input, df, tfidf, top_n=5):
    query = user_input.lower().strip()

    filtered_df = filter_recipes(df, query, top_n=top_n)

    filtered_matrix = tfidf.transform(filtered_df["search_text"])
    query_vector = tfidf.transform([query])

    similarity_scores = cosine_similarity(query_vector, filtered_matrix).flatten()
    top_indices = similarity_scores.argsort()[::-1][:top_n]

    results = filtered_df.iloc[top_indices][
        ["title","calories","protein","fat","categories", "ingredients", "directions"]
    ].copy()

    results["ingredients"] = results["ingredients"].apply(parse_ingredients)
    results["directions"] = results["directions"].apply(parse_directions)

    results["score"] = similarity_scores[top_indices]

    return results

