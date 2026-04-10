#Import Python libraries
from pathlib import Path
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

#Retrieve and preprocess data
BASE_DIR = Path(__file__).resolve().parent
csv_path = BASE_DIR / "recipe_with_directions.csv"

merged_df = pd.read_csv(csv_path)
print(merged_df.head())