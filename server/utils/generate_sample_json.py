import pandas as pd
import json

# Load your encoded dataset
df = pd.read_csv("encoded_dataset_optimized.csv")

# Drop target column
X = df.drop(columns=["price"])

# Create a base sample with all features set to 0
sample_input = dict.fromkeys(X.columns, 0)

# Set some meaningful example values
sample_input["total_sqft"] = 1200
sample_input["bath"] = 2
sample_input["balcony"] = 1
sample_input["BHK"] = 2

# Set a specific area type (only one should be 1, rest 0)
sample_input["area_type_Super built-up  Area"] = 1

# Set a specific availability
sample_input["availability_Ready To Move"] = 1

# Set a location (only one should be 1)
sample_input["location_Whitefield"] = 1

# Save to JSON file
with open("sample_input.json", "w") as f:
    json.dump(sample_input, f, indent=4)

print("✅ Sample input JSON generated as 'sample_input.json'")