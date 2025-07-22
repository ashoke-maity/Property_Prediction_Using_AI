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

try:
    # Load feature names from the dataset to ensure correct input shape
    feature_df = pd.read_csv("encoded_dataset_optimized.csv")
    feature_columns = feature_df.drop(columns=["price"]).columns.tolist()
    print(f"✅ Feature columns loaded: {len(feature_columns)} features")
    print(f"📋 Sample features: {feature_columns[:5]}...")
except Exception as e:
    print(f"❌ Error loading feature columns: {e}")
    feature_columns = []

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
        for key, value in input_data.items():
            if key in feature_columns:
                # Handle NaN values
                if pd.isna(value) or value is None:
                    X_input[key] = 0
                else:
                    X_input[key] = float(value)
            else:
                print(f"⚠️ Warning: Feature '{key}' not found in model features")
        
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