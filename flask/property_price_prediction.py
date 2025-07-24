from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model and feature columns
try:
    model = joblib.load("property_price_prediction_model.pkl")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Try to get feature names from the model first, then fallback to dataset or basic set
feature_columns = []

try:
    # Method 1: Try to get feature names directly from the model
    if model and hasattr(model, 'feature_names_in_'):
        feature_columns = model.feature_names_in_.tolist()
        print(f"✅ Feature columns loaded from model: {len(feature_columns)} features")
        print(f"📋 Sample features: {feature_columns[:5]}...")
    
    # Method 2: Try to load from dataset file
    elif os.path.exists("encoded_dataset_optimized.csv"):
        print("📁 Found dataset file, loading feature columns...")
        feature_df = pd.read_csv("encoded_dataset_optimized.csv")
        loaded_features = feature_df.drop(columns=["price"]).columns.tolist()
        if loaded_features:
            feature_columns = loaded_features
            print(f"✅ Feature columns loaded from dataset: {len(feature_columns)} features")
            print(f"📋 Sample features: {feature_columns[:5]}...")
        else:
            print("⚠️ No features found in dataset, using basic feature set")
    else:
        print("⚠️ Dataset file not found, using basic feature set")
        
    # Method 3: Fallback to basic feature set if nothing else worked
    if not feature_columns:
        print("🔧 No features loaded, using basic fallback set")
        feature_columns = [
            'total_sqft', 'bath', 'balcony', 'BHK',
            'area_type_Carpet  Area', 'area_type_Plot  Area', 'area_type_Super built-up  Area',
            'availability_Ready To Move', 'location_other'
        ]
        
    print(f"📋 Final feature set: {len(feature_columns)} features")
    print(f"📊 Sample features: {feature_columns[:5] if len(feature_columns) >= 5 else feature_columns}")
        
except Exception as e:
    print(f"❌ Error loading feature columns: {e}")
    # Emergency fallback
    feature_columns = [
        'total_sqft', 'bath', 'balcony', 'BHK',
        'area_type_Carpet  Area', 'area_type_Plot  Area', 'area_type_Super built-up  Area',
        'availability_Ready To Move'
    ]
    print(f"📋 Using emergency fallback features: {len(feature_columns)} features")

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "Flask server is running!",
        "model_loaded": model is not None,
        "features_loaded": len(feature_columns) > 0,
        "feature_count": len(feature_columns)
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        if not feature_columns:
            return jsonify({"error": "Feature columns not loaded"}), 500
        
        input_data = request.get_json()
        print(f"📥 Received input data: {input_data}")
        
        if not input_data:
            return jsonify({"error": "No input data provided"}), 400

        # Create a DataFrame with all expected features, filled with 0s
        X_input = pd.DataFrame(0, index=[0], columns=feature_columns)
        
        # Fill in the provided values
        provided_features = []
        for key, value in input_data.items():
            if key in feature_columns:
                # Handle NaN values
                if pd.isna(value) or value is None:
                    X_input[key] = 0
                else:
                    X_input[key] = float(value)
                    if float(value) != 0:
                        provided_features.append(key)
            else:
                print(f"⚠️ Warning: Feature '{key}' not found in model features")
        
        print(f"📊 Features provided with non-zero values: {provided_features}")
        
        # Ensure at least one availability feature is set
        availability_features = [col for col in feature_columns if col.startswith('availability_')]
        availability_set = any(X_input[col].iloc[0] == 1 for col in availability_features if col in X_input.columns)
        
        if not availability_set:
            # Default to 'Ready To Move' if no availability is set
            if 'availability_Ready To Move' in X_input.columns:
                X_input['availability_Ready To Move'] = 1
                print("🔧 No availability feature set, defaulting to 'Ready To Move'")
        
        # Ensure at least one area type is set
        area_type_features = [col for col in feature_columns if col.startswith('area_type_')]
        area_type_set = any(X_input[col].iloc[0] == 1 for col in area_type_features if col in X_input.columns)
        
        if not area_type_set:
            # Default to 'Super built-up Area' if no area type is set
            if 'area_type_Super built-up  Area' in X_input.columns:
                X_input['area_type_Super built-up  Area'] = 1
                print("🔧 No area type feature set, defaulting to 'Super built-up Area'")
        
        # Ensure location_other is set if no other location is set
        location_features = [col for col in feature_columns if col.startswith('location_')]
        location_set = any(X_input[col].iloc[0] == 1 for col in location_features if col in X_input.columns)
        
        if not location_set:
            # Default to 'location_other' if no location is set
            if 'location_other' in X_input.columns:
                X_input['location_other'] = 1
                print("🔧 No location feature set, defaulting to 'location_other'")
        
        print(f"📊 Input DataFrame shape: {X_input.shape}")
        print(f"📊 Non-zero features: {X_input.loc[0][X_input.loc[0] != 0].to_dict()}")
        
        # Check for NaN values before prediction
        if X_input.isna().any().any():
            nan_columns = X_input.columns[X_input.isna().any()].tolist()
            print(f"❌ NaN values found in columns: {nan_columns}")
            return jsonify({
                "error": f"NaN values found in columns: {nan_columns}",
                "status": "error"
            }), 400
        
        # Make prediction
        prediction = model.predict(X_input)
        predicted_price = round(float(prediction[0]), 2)
        
        print(f"🎯 Prediction result: {predicted_price}")

        return jsonify({
            "predicted_price": predicted_price,
            "status": "success",
            "input_features": len(feature_columns),
            "location_handling": "dynamic"
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Prediction error: {error_msg}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        return jsonify({
            "error": error_msg,
            "status": "error",
            "traceback": traceback.format_exc() if app.debug else None
        }), 400

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT"))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    print(f"🚀 Starting Flask server on port {port}")
    print(f"🔧 Debug mode: {debug_mode}")
    print(f"🤖 Model loaded: {model is not None}")
    print(f"📊 Features loaded: {len(feature_columns)}")
    
    app.run(debug=debug_mode, host="0.0.0.0", port=port)