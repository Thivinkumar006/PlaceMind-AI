import pandas as pd
import io
import re

def normalize_column_name(col_name: str) -> str:
    return re.sub(r'[^a-z0-9]', '', str(col_name).lower())

EXPECTED_COLUMNS = {
    "rollno": "roll_number", "rollnumber": "roll_number", "roll": "roll_number", "roll_no": "roll_number",
    "registrationnumber": "roll_number", "regno": "roll_number", "id": "roll_number", "studentid": "roll_number", 
    "name": "name", "studentname": "name", "fullname": "name", "firstname": "name",
    "department": "department", "dept": "department", "branch": "department", "stream": "department", "course": "department", "program": "department", "degree": "department",
    "batchyear": "batch_year", "yearofgraduation": "batch_year", "graduationyear": "batch_year", "batch": "batch_year", "passingyear": "batch_year", "yearofpassing": "batch_year", "yop": "batch_year", "passoutyear": "batch_year", "year": "batch_year",
    "email": "email", "emailid": "email", "email_id": "email", "emailaddress": "email", "mail": "email",
    "phonenumber": "mobile_number", "phone": "mobile_number", "mobilenumber": "mobile_number", "mobile": "mobile_number", "contact": "mobile_number", "contactnumber": "mobile_number", "contactno": "mobile_number", "mobno": "mobile_number", "whatsapp": "mobile_number", "phoneno": "mobile_number",
}

# Simulate the user's Excel file as bytes using openpyxl directly or something,
# or we can just create a dataframe and save it.
import openpyxl

wb = openpyxl.Workbook()
ws = wb.active
# Let's say there's a title row, then empty row, then headers.
ws.append(["Some Title Here"])
ws.append([])
ws.append(["Roll Number", "Name", "Department", "Email ID", "Mobile No", "Batch Year"])
ws.append(["101", "Alice", "CS", "alice@example.com", "9999", 2024])

buffer = io.BytesIO()
wb.save(buffer)
contents = buffer.getvalue()

# Now the exact logic
df_test = pd.read_excel(io.BytesIO(contents), header=None, engine='openpyxl')
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

print(f"best_row_idx: {best_row_idx}")
if max_matches > 0:
    df = pd.read_excel(io.BytesIO(contents), header=best_row_idx, engine='openpyxl')
else:
    df = pd.read_excel(io.BytesIO(contents), engine='openpyxl')

df = df.dropna(how='all')
df = df.where(pd.notnull(df), None)

column_mapping = {}
mapped_headers = {}
for col in df.columns:
    norm_col = normalize_column_name(col)
    if norm_col in EXPECTED_COLUMNS:
        db_field = EXPECTED_COLUMNS[norm_col]
        column_mapping[str(col)] = db_field
        mapped_headers[db_field] = str(col)
        
print(f"column_mapping: {column_mapping}")
preview_data = []

for index, row in df.iterrows():
    row_dict = row.to_dict()
    mapped_data = {}
    for col, db_field in column_mapping.items():
        val = row_dict.get(col)
        if val is not None:
            mapped_data[db_field] = val
    print(mapped_data)
