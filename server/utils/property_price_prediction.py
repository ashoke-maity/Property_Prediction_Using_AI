from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os

load_dotenv()


app = Flask(__name__)

# Load the trained model
model = joblib.load("property_price_prediction_model.pkl")

# Load feature names from the dataset to ensure correct input shape
feature_df = pd.read_csv("encoded_dataset_optimized.csv")
feature_columns = feature_df.drop(columns=["price"]).columns.tolist()

@app.route("/predict", methods=["POST"])
def predict():
    try:
        input_data = request.get_json()

        # Ensure input matches model features
        X_input = pd.DataFrame([input_data], columns=feature_columns)
        prediction = model.predict(X_input)

        return jsonify({
            "predicted_price": round(float(prediction[0]), 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT"))  # Default to 5001 if FLASK_PORT not set
    app.run(debug=os.getenv("FLASK_DEBUG", "False") == "True", host="0.0.0.0", port=port)