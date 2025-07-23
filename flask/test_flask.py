#!/usr/bin/env python3
"""
Test script to verify Flask server is working correctly
"""

import requests
import json

def test_flask_health():
    """Test Flask health endpoint"""
    try:
        response = requests.get("http://localhost:5001/")
        print("🔍 Health Check Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_flask_prediction():
    """Test Flask prediction endpoint"""
    try:
        # Sample data that matches what Node.js sends
        test_data = {
            'total_sqft': 1200,
            'bath': 2,
            'balcony': 1,
            'BHK': 2,
            'area_type_Carpet  Area': 0,
            'area_type_Plot  Area': 0,
            'area_type_Super built-up  Area': 1,
            'availability_Ready To Move': 1,
            'location_other': 1
        }
        
        print("🧪 Testing prediction with data:")
        print(json.dumps(test_data, indent=2))
        
        response = requests.post(
            "http://localhost:5001/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📊 Prediction Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Flask Server...")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_flask_health()
    print("\n" + "=" * 50)
    
    # Test prediction endpoint
    if health_ok:
        prediction_ok = test_flask_prediction()
        print("\n" + "=" * 50)
        
        if health_ok and prediction_ok:
            print("✅ All tests passed! Flask server is working correctly.")
        else:
            print("❌ Some tests failed. Check the output above.")
    else:
        print("❌ Health check failed. Flask server may not be running.")
        print("💡 Make sure to start Flask server first: python property_price_prediction.py")