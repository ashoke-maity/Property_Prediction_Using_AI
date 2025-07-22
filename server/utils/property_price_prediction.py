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

        # Ensure input matches model features
        X_input = pd.DataFrame([input_data], columns=feature_columns)
        print(f"📊 Input DataFrame shape: {X_input.shape}")
        print(f"📊 Input DataFrame columns: {list(X_input.columns)}")
        
        # Make prediction
        prediction = model.predict(X_input)
        predicted_price = round(float(prediction[0]), 2)
        
        print(f"🎯 Prediction result: {predicted_price}")

        return jsonify({
            "predicted_price": predicted_price,
            "status": "success",
            "input_features": len(feature_columns)
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
    port = int(os.environ.get("FLASK_PORT", 5001))  # Default to 5001 if FLASK_PORT not set
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    print(f"🚀 Starting Flask server on port {port}")
    print(f"🔧 Debug mode: {debug_mode}")
    print(f"🤖 Model loaded: {model is not None}")
    print(f"📊 Features loaded: {len(feature_columns)}")
    
    app.run(debug=debug_mode, host="0.0.0.0", port=port)