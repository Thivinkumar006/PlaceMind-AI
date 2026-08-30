import requests
import json

data = {
    "records": [
        {
            "roll_number": "STU101",
            "name": "Sample Student",
            "department": "CSE",
            "batch_year": 2024,
            "gender": "Male",
            "is_hosteller": False,
            "sslc_percentage": 90.0,
            "sslc_year": 2018,
            "hsc_percentage": 85.0,
            "hsc_year": 2020,
            "ug_percentage": 80.0,
            "ug_year": 2024,
            "cgpa": 8.5,
            "email": "student@example.com",
            "mobile_number": "9876543210"
        }
    ]
}

res = requests.post("http://localhost:8000/api/v1/students/import/confirm", json=data)
print(res.status_code)
print(res.json())
