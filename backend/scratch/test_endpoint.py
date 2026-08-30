import requests
import io
import pandas as pd
import openpyxl

# Create a sample Excel file in memory
wb = openpyxl.Workbook()
ws = wb.active
ws.append(["Roll Number", "Name", "Department", "Email ID", "Mobile No", "Batch Year"])
ws.append(["101", "Alice", "CS", "alice@example.com", "9999", 2024])

buffer = io.BytesIO()
wb.save(buffer)
contents = buffer.getvalue()

files = {'file': ('test.xlsx', contents, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
response = requests.post("http://localhost:8000/api/v1/students/import/preview", files=files)

print("Status:", response.status_code)
try:
    print(response.json())
except Exception as e:
    print(response.text)
