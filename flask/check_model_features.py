#!/usr/bin/env python3
"""
Script to check what features the trained model expects
"""

import joblib
import pandas as pd
import os

def check_model_features():
    try:
        # Load the model
        model = joblib.load("property_price_prediction_model.pkl")
        print("✅ Model loaded successfully!")
        
        # Try to get feature names from the model
        if hasattr(model, 'feature_names_in_'):
            features = model.feature_names_in_
            print(f"📊 Model expects {len(features)} features:")
            
            # Group features by type
            availability_features = [f for f in features if f.startswith('availability_')]
            area_type_features = [f for f in features if f.startswith('area_type_')]
            location_features = [f for f in features if f.startswith('location_')]
            basic_features = [f for f in features if not any(f.startswith(prefix) for prefix in ['availability_', 'area_type_', 'location_'])]
            
            print(f"\n🏠 Basic features ({len(basic_features)}):")
            for f in basic_features:
                print(f"  - {f}")
                
            print(f"\n📅 Availability features ({len(availability_features)}):")
            for f in sorted(availability_features):
                print(f"  - {f}")
                
            print(f"\n📐 Area type features ({len(area_type_features)}):")
            for f in area_type_features:
                print(f"  - {f}")
                
            print(f"\n📍 Location features ({len(location_features)}):")
            for f in sorted(location_features):
                print(f"  - {f}")
                
            # Save all features to a file for easy reference
            with open('model_features.txt', 'w') as f:
                f.write("# All model features\n")
                for feature in sorted(features):
                    f.write(f"{feature}\n")
            print(f"\n💾 All features saved to 'model_features.txt'")
            
        else:
            print("❌ Model doesn't have feature_names_in_ attribute")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_model_features()