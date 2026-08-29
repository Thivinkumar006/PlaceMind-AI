import urllib.request
import json

students = [
    {
        "roll_number": "STU001",
        "name": "Rahul Sharma",
        "department": "CSE",
        "batch_year": 2027,
        "gender": "Male",
        "is_hosteller": True,
        "sslc_percentage": 92.5,
        "sslc_year": 2021,
        "hsc_percentage": 94.2,
        "hsc_year": 2023,
        "ug_percentage": 88.5,
        "ug_year": 2027,
        "cgpa": 8.9,
        "email": "rahul.sharma@example.com",
        "mobile_number": "9876543210",
        "github_link": "https://github.com/rahulsharma",
        "linkedin_link": "https://linkedin.com/in/rahulsharma",
        "portfolio_link": "https://rahulsharma.dev",
        "resume_link": "https://example.com/resume/rahul.pdf",
        "video_link": "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "photo_link": "https://i.pravatar.cc/150?u=rahul",
        "placement_status": "Placed",
        "company_name": "Google",
        "ctc_lpa": 32.5
    },
    {
        "roll_number": "STU002",
        "name": "Priya Singh",
        "department": "IT",
        "batch_year": 2027,
        "gender": "Female",
        "is_hosteller": False,
        "sslc_percentage": 95.0,
        "sslc_year": 2021,
        "hsc_percentage": 96.5,
        "hsc_year": 2023,
        "ug_percentage": 91.2,
        "ug_year": 2027,
        "cgpa": 9.2,
        "email": "priya.singh@example.com",
        "mobile_number": "9876543211",
        "github_link": "https://github.com/priyasingh",
        "linkedin_link": "https://linkedin.com/in/priyasingh",
        "portfolio_link": "https://priyasingh.design",
        "photo_link": "https://i.pravatar.cc/150?u=priya",
        "placement_status": "Unplaced"
    },
    {
        "roll_number": "STU003",
        "name": "Amit Kumar",
        "department": "ECE",
        "batch_year": 2027,
        "gender": "Male",
        "is_hosteller": True,
        "sslc_percentage": 85.5,
        "sslc_year": 2021,
        "hsc_percentage": 88.0,
        "hsc_year": 2023,
        "ug_percentage": 82.5,
        "ug_year": 2027,
        "cgpa": 7.8,
        "email": "amit.kumar@example.com",
        "mobile_number": "9876543212",
        "github_link": "https://github.com/amitk",
        "photo_link": "https://i.pravatar.cc/150?u=amit",
        "placement_status": "Unplaced"
    },
    {
        "roll_number": "STU004",
        "name": "Sneha Patel",
        "department": "CSE",
        "batch_year": 2027,
        "gender": "Female",
        "is_hosteller": False,
        "sslc_percentage": 97.5,
        "sslc_year": 2021,
        "hsc_percentage": 98.2,
        "hsc_year": 2023,
        "ug_percentage": 93.5,
        "ug_year": 2027,
        "cgpa": 9.5,
        "email": "sneha.patel@example.com",
        "mobile_number": "9876543213",
        "github_link": "https://github.com/snehap",
        "linkedin_link": "https://linkedin.com/in/snehapatel",
        "resume_link": "https://example.com/resume/sneha.pdf",
        "photo_link": "https://i.pravatar.cc/150?u=sneha",
        "placement_status": "Placed",
        "company_name": "Microsoft",
        "ctc_lpa": 45.0
    },
    {
        "roll_number": "STU005",
        "name": "Vikram Malhotra",
        "department": "EEE",
        "batch_year": 2027,
        "gender": "Male",
        "is_hosteller": True,
        "sslc_percentage": 89.0,
        "sslc_year": 2021,
        "hsc_percentage": 91.5,
        "hsc_year": 2023,
        "ug_percentage": 85.5,
        "ug_year": 2027,
        "cgpa": 8.1,
        "email": "vikram.m@example.com",
        "mobile_number": "9876543214",
        "linkedin_link": "https://linkedin.com/in/vikramm",
        "photo_link": "https://i.pravatar.cc/150?u=vikram",
        "placement_status": "Unplaced"
    }
]

url = "http://localhost:8000/api/v1/students/"

print("Seeding database...")
for student in students:
    req = urllib.request.Request(url, data=json.dumps(student).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"Added {student['name']}")
    except urllib.error.HTTPError as e:
        print(f"Failed to add {student['name']}: {e.read().decode('utf-8')}")

print("Seeding complete.")
