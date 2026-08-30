import pandas as pd
import re

def normalize_column_name(col_name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', str(col_name).lower())

EXPECTED_COLUMNS = {
    "rollno": "roll_number", "name": "name", "department": "department",
    "email": "email", "phonenumber": "mobile_number", "batchyear": "batch_year"
}

# Create a sample DataFrame directly
df = pd.DataFrame([
    {"Roll No": "123", "Name": "Alice", "Department": "CS", "Email": "a@b.com", "Phone Number": "999", "Batch Year": 2024}
])

column_mapping = {}
for col in df.columns:
    norm_col = normalize_column_name(col)
    if norm_col in EXPECTED_COLUMNS:
        db_field = EXPECTED_COLUMNS[norm_col]
        column_mapping[str(col)] = db_field

print(f"df.columns: {df.columns}")
print(f"column_mapping: {column_mapping}")

for index, row in df.iterrows():
    row_dict = row.to_dict()
    print(f"row_dict keys type: {[type(k) for k in row_dict.keys()]}")
    print(f"row_dict: {row_dict}")
    mapped_data = {}
    for col, db_field in column_mapping.items():
        print(f"Trying to get col: '{col}' (type {type(col)}) from row_dict")
        val = row_dict.get(col)
        print(f"Value found: {val}")
        if val is not None:
            mapped_data[db_field] = val
    print(f"mapped_data: {mapped_data}")
