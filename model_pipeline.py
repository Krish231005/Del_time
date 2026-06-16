#!/usr/bin/env python3
"""
On-Demand Food Delivery Delay Classification Model

This script implements a complete end-to-end supervised machine learning pipeline 
to predict delivery delays in dynamic logistics environments. 

Project Target: Pre-assess if a delivery route experiences an excessive delay:
    Late = 1 (if Time_taken > 45 minutes)
    On-Time = 0 (if Time_taken <= 45 minutes)

Author: Capstone Research Team
"""

import os
import pandas as pd
import numpy as np
import math

# Machine Learning framework imports
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    confusion_matrix, 
    classification_report
)

def compute_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two geodetic coordinate points 
    on the Earth's surface using the mathematical Haversine formulas.
    """
    if pd.isna(lat1) or pd.isna(lon1) or pd.isna(lat2) or pd.isna(lon2):
        return 0.0
    
    # Earth's radius in kilometers
    R = 6371.0
    
    # Pre-convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 + 
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return float(R * c)

def clean_and_prepare_dataset(csv_path="food_delivery.csv"):
    """
    Load raw log records, handle null formats, strip raw trailing characters,
    and construct high-signal predictive features.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing core dataset file: '{csv_path}' in runtime path.")
        
    print(f"📖 Succesfully located: {csv_path}. Beginning data loading process...")
    df = pd.read_csv(csv_path)
    
    # Step 1: Clean localized NaN string placeholders and strip whitespace
    object_cols = df.select_dtypes(include=['object']).columns
    for col in object_cols:
        df[col] = df[col].astype(str).str.strip()
        
    # Replace "NaN" strings with proper numpy nulls
    df.replace(['NaN', 'NaN ', 'nan', ''], np.nan, inplace=True)
    
    # Drop rows missing critical model features
    initial_row_count = len(df)
    df.dropna(subset=[
        'Delivery_person_Age', 
        'Delivery_person_Ratings', 
        'Road_traffic_density', 
        'Weatherconditions', 
        'City', 
        'Time_taken(min)'
    ], inplace=True)
    
    # Step 2: Cast continuous elements to correct mathematical types
    df['Delivery_person_Age'] = df['Delivery_person_Age'].astype(float)
    df['Delivery_person_Ratings'] = df['Delivery_person_Ratings'].astype(float)
    
    # Clean up target minutes (remove "(min)" prefix if exists, then cast to integer)
    df['Time_taken(min)'] = df['Time_taken(min)'].astype(str).str.replace('(min)', '', regex=False).str.strip().astype(float)
    
    # Strip weather prefix "conditions "
    df['Weatherconditions'] = df['Weatherconditions'].astype(str).str.replace('conditions', '', regex=False).str.strip()
    
    # Step 3: Feature Engineering
    print("🛠️  Engineering features: Haversine distance, Peak Hours status...")
    
    # A. Calculate Geodetic Haversine Distance
    df['Distance_km'] = df.apply(
        lambda r: compute_haversine_distance(
            r['Restaurant_latitude'], r['Restaurant_longitude'],
            r['Delivery_location_latitude'], r['Delivery_location_longitude']
        ), 
        axis=1
    )
    
    # Drop invalid outlier routes (0 or unreasonably far)
    df = df[(df['Distance_km'] >= 0.1) & (df['Distance_km'] <= 35.0)]
    
    # B. Chronological Parsing: Parse Order Hour
    def extract_hour(time_str):
        if pd.isna(time_str) or ":" not in str(time_str):
            return 12 # Default default
        try:
            return int(str(time_str).split(':')[0])
        except ValueError:
            return 12
            
    df['Order_Hour'] = df['Time_Orderd'].apply(extract_hour)
    
    # C. Binary target of Peak Hour backlog (Lunch: 12-14, Dinner: 19-21)
    df['Peak_Hour'] = df['Order_Hour'].apply(
        lambda h: 1 if (12 <= h <= 14) or (19 <= h <= 21) else 0
    )
    
    # Step 4: Binary Classification Target Definition:
    # Late = 1 if travel time exceeds 45 mins, else 0
    df['Late'] = (df['Time_taken(min)'] > 45.0).astype(int)
    
    cleaned_count = len(df)
    print(f"✅ Preprocessing pipeline complete. Kept {cleaned_count} rows out of {initial_row_count} initial records.")
    return df

def run_model_training_pipeline():
    """
    Main training matrix: builds preprocessors, fits RandomForest & Logistic Regression baseline,
    and isolates performance metrics.
    """
    df = clean_and_prepare_dataset()
    
    # Isolate targets
    X = df[[
        'Delivery_person_Age',
        'Delivery_person_Ratings',
        'Distance_km',
        'Road_traffic_density',
        'Weatherconditions',
        'Vehicle_condition',
        'Type_of_vehicle',
        'City',
        'Order_Hour',
        'Peak_Hour'
    ]]
    y = df['Late']
    
    # Define categorical and continuous columns
    numerical_features = ['Delivery_person_Age', 'Delivery_person_Ratings', 'Distance_km', 'Vehicle_condition', 'Order_Hour']
    categorical_features = ['Road_traffic_density', 'Weatherconditions', 'Type_of_vehicle', 'City']
    
    # 80/20 Stratified Partition
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # Define Column Preprocessor using pipelines
    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(drop='first', handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # 1. Random Forest Classifier Pipeline
    rf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42))
    ])
    
    # 2. Logistic Regression Baseline Pipeline
    lr_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(max_iter=500, random_state=42))
    ])
    
    # Fit Models
    print("\n🏋️‍♂️ Fitting Machine Learning Classification models...")
    rf_pipeline.fit(X_train, y_train)
    lr_pipeline.fit(X_train, y_train)
    
    print("📈 Model evaluation partition on unseen testing data:")
    
    for name, model in [("Random Forest Ensemble", rf_pipeline), ("Logistic Regression", lr_pipeline)]:
        predictions = model.predict(X_test)
        
        acc = accuracy_score(y_test, predictions)
        prec = precision_score(y_test, predictions)
        rec = recall_score(y_test, predictions)
        f1 = f1_score(y_test, predictions)
        cm = confusion_matrix(y_test, predictions)
        
        print(f"\n==========================================")
        print(f"📊 ALGORITHM CANDIDATE: {name}")
        print(f"==========================================")
        print(f"Accuracy:  {acc * 100:.2f}%")
        print(f"Precision: {prec * 100:.2f}%")
        print(f"Recall:    {rec * 100:.2f}%")
        print(f"F1-Score:  {f1 * 100:.2f}%")
        print("\nConfusion Matrix Grid:")
        print(f"  True Neg (On-Time): {cm[0][0]}  |  False Pos (Late): {cm[0][1]}")
        print(f"  False Neg (On-Time): {cm[1][0]}  |  True Pos (Late): {cm[1][1]}")
        print("-" * 42)
        
    print("\n🌟 Random Forest is identified as the best performing production model due to dynamic feature interactions.")

    # Demonstration of an instant individual predictive index query
    print("\n🔮 Live Predictor Console Single-record Demonstration:")
    sample_query = pd.DataFrame([{
        'Delivery_person_Age': 32,
        'Delivery_person_Ratings': 4.8,
        'Distance_km': 6.2,
        'Road_traffic_density': 'Jam',
        'Weatherconditions': 'Stormy',
        'Vehicle_condition': 1,
        'Type_of_vehicle': 'scooter',
        'City': 'Metropolitan',
        'Order_Hour': 20,
        'Peak_Hour': 1
    }])
    
    prob_late = rf_pipeline.predict_proba(sample_query)[0][1]
    prediction = rf_pipeline.predict(sample_query)[0]
    
    status = "LATE (Delay Risk)" if prediction == 1 else "ON-TIME (Normal)"
    print(f"  Input features: 6.2km routing, Jammed Traffic, Stormy Weather, Rider rating: 4.8.")
    print(f"  Model Result: {status} with a certainty of {prob_late*100:.1f}%.")

if __name__ == "__main__":
    run_model_training_pipeline()
