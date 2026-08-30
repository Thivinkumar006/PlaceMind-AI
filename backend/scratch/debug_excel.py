import pandas as pd
import io
import re

def normalize_column_name(col_name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', str(col_name).lower())

EXPECTED_COLUMNS = {
    "rollno": "roll_number", "rollnumber": "roll_number", "roll": "roll_number", "roll_no": "roll_number",
    "name": "name", "studentname": "name", "fullname": "name", "firstname": "name",
    "department": "department", "dept": "department", "branch": "department", "stream": "department", "course": "department", "program": "department", "degree": "department",
    "batchyear": "batch_year", "yearofgraduation": "batch_year", "graduationyear": "batch_year", "batch": "batch_year", "passingyear": "batch_year", "yearofpassing": "batch_year", "yop": "batch_year", "passoutyear": "batch_year", "year": "batch_year",
    "email": "email", "emailid": "email", "email_id": "email", "emailaddress": "email", "mail": "email",
    "phonenumber": "mobile_number", "phone": "mobile_number", "mobilenumber": "mobile_number", "mobile": "mobile_number", "contact": "mobile_number", "contactnumber": "mobile_number", "contactno": "mobile_number", "mobno": "mobile_number", "whatsapp": "mobile_number", "phoneno": "mobile_number", "mobileno": "mobile_number",
}

# Create a test excel
df_dummy = pd.DataFrame({
    "Roll No": ["123", "124"],
    "Name": ["Alice", "Bob"],
    "Department": ["CS", "IT"],
    "Email ID": ["alice@test.com", "bob@test.com"],
    "Batch Year": [2024, 2024],
    "Phone Number": ["9876543210", "1234567890"]
})
df_dummy.to_excel("scratch/dummy.xlsx", index=False)

df_test = pd.read_excel("scratch/dummy.xlsx", header=None)
best_row_idx = 0
max_matches = 0
for idx, row in df_test.head(20).iterrows():
    matches = 0
    for col_idx, val in row.items():
        if pd.isna(val) or not isinstance(val, str):
            continue
        norm_val = normalize_column_name(val)
        if norm_val in EXPECTED_COLUMNS:
            matches += 1
    if matches > max_matches:
        max_matches = matches
        best_row_idx = idx

print(f"best_row_idx: {best_row_idx}, max_matches: {max_matches}")

if max_matches > 0:
    df = pd.read_excel("scratch/dummy.xlsx", header=best_row_idx)
else:
    df = pd.read_excel("scratch/dummy.xlsx")
    
df = df.dropna(how='all')
df = df.where(pd.notnull(df), None)

column_mapping = {}
for col in df.columns:
    norm_col = normalize_column_name(str(col))
    if norm_col in EXPECTED_COLUMNS:
        db_field = EXPECTED_COLUMNS[norm_col]
        column_mapping[col] = db_field
        
print(f"Columns: {df.columns.tolist()}")
print(f"Column Mapping: {column_mapping}")

for index, row in df.head(2).iterrows():
    row_dict = row.to_dict()
    mapped_data = {}
    for col, db_field in column_mapping.items():
        val = row_dict.get(col)
        # BUG SUSPICION: pd.isna(val) might fail or behave weirdly for certain types, or val might be something unexpected
        if val is not None and not pd.isna(val):
            mapped_data[db_field] = val
    print(f"Row {index} mapped_data: {mapped_data}")
