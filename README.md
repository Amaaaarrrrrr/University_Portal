# 🎓 University Portal Platform

A full-stack university student portal built with **React (frontend)** and **Flask (backend)**. It supports role-based dashboards for **Students**, **Lecturers**, and **Admins**, and provides features like academic unit registration, hostel booking, grade viewing/posting, fee payments, document requests, and clearance tracking.

---

## 📌 Features

### 👨‍🎓 Students
- Should register then login
- Register for academic units by semester
- Book hostel rooms and accommodations
- View fee structure and make payments
- Check clearance status
- Request documents (e.g., transcripts)
- View personal academic grades
- Receive announcements and alerts

### 👩‍🏫 Lecturers
- Should register then login
- View assigned courses
- View enrolled students per course
- Post and update grades
- Post announcements

### 🛠️ Admins
- Should only login (
        Email - admin@university.edu
        Password - adminpass
  )
- Manage users (students, lecturers)
- Set up semesters and programs
- Assign rooms and manage hostels
- Approve fee clearance
- Create fee structures


---

## 🧱 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React, Axios, React Router |
| Backend   | Flask, SQLAlchemy, Marshmallow, Flask-JWT-Extended |
| Database  | PostgreSQL / MySQL / SQLite |
| Styling   | TailwindCSS or Bootstrap |
| Auth      | JWT (JSON Web Tokens) |
| Deployment| Render / Vercel / Heroku |

---

## 🚀 Getting Started

### 🧰 Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 

---

### 🖥️ Backend Setup

```bash
cd Server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Create a .env file in /backend:

env
Copy
Edit
FLASK_ENV=development
DATABASE_URL=postgresql://dashboard:Student@localhost:5432/student_portal
SECRET_KEY=your_updated_secret_key_here 
JWT_SECRET_KEY=super-secret-jwt-key
Run the server:

bash
Copy
Edit
flask db init
flask db migrate
flask db upgrade
flask run
💻 Frontend Setup
bash
Copy
Edit
cd Client
npm install
npm run dev


🧪 API Endpoints Summary

Area	Path	Method
Auth	/api/register, /api/login	POST
Courses	/api/courses, /api/registration	GET/POST/DELETE
Hostels	/api/hostels, /api/bookings	GET/POST/DELETE
Fees	/api/feestructure, /api/payments	GET/POST
Clearance	/api/clearance/<student_id>	GET/PUT
Grades	/api/grades, /api/grades/<id>	GET/POST/PUT
Announcements	/api/announcements	GET/POST
Admin Functions	/api/admin/users, /admin/semesters, etc.	GET/POST/DELETE
Full API documentation coming soon via Swagger/Postman!

🙋 Contribution Guide
Fork the repo

Create a new branch (git checkout -b feature-name)

Commit your changes (git commit -m 'Add feature')

Push to your branch (git push origin feature-name)

Open a pull request

📄 License
This project is open-source and available under the MIT License.

🙌 Acknowledgments
Special thanks to:

Flask & React communities

Open source contributors

You, for building something meaningful!

📬 Contact
For feedback, ideas, or collaboration: 📧 Email:mutsjoy1693@gmail.com.com
