import os
import sys
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy import text
from faker import Faker

fake = Faker()


# Import app and models
from app import app
engine= create_engine(app.config['SQLALCHEMY_DATABASE_URI'])

# Add the parent directory to sys.path to import models if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import (
    db, User, StudentProfile, LecturerProfile, Course, Semester, 
    UnitRegistration, Grade, Announcement, AuditLog, DocumentRequest,
    Hostel, Room, StudentRoomBooking, FeeStructure, Payment, FeeClearance, Assignment
)

# Load environment variables
load_dotenv()

# Database configuration

# Create engine and db.session


def create_users():
    """Create admin, student, and lecturer users"""
    print("Creating users...")

    admin = User(
        name="Admin User",
        email="admin@university.edu",
        role="admin",
        password_hash=generate_password_hash("adminpass")
    )
    db.session.add(admin)

    students = []
    for i in range(1, 11):
        student = User(
            name=f"Student {i}",
            email=f"student{i}@university.edu",
            role="student",
            password_hash=generate_password_hash(f"student{i}pass")
        )
        db.session.add(student)
        students.append(student)

    lecturers = []
    for i in range(1, 6):
        lecturer = User(
            name=f"Lecturer {i}",
            email=f"lecturer{i}@university.edu",
            role="lecturer",
            password_hash=generate_password_hash(f"lecturer{i}pass")
        )
        db.session.add(lecturer)
        lecturers.append(lecturer)

    db.session.commit()
    print("Users created successfully.")
    return admin, students, lecturers

def create_profiles(students, lecturers):
    """Create profiles for students and lecturers"""
    print("Creating profiles...")

    programs = ["Computer Science", "Business Administration", "Engineering", "Medicine", "Arts"]
    departments = ["Computer Science", "Business", "Engineering", "Medicine", "Arts"]

    for i, student in enumerate(students):
        student_profile = StudentProfile(
            user_id=student.id,
            reg_no=f"STU2023{i+1:03d}",
            program=random.choice(programs),
            year_of_study=random.randint(1, 4),
            phone=f"+1234567{i+1:04d}"
        )
        db.session.add(student_profile)

    for i, lecturer in enumerate(lecturers):
        lecturer_profile = LecturerProfile(
            user_id=lecturer.id,
            staff_no=f"LEC2023{i+1:03d}",
            department=random.choice(departments),
            phone=f"+2345678{i+1:04d}"
        )
        db.session.add(lecturer_profile)

    db.session.commit()
    print("Profiles created successfully.")

def create_semesters():
    """Create academic semesters"""
    print("Creating semesters...")

    semesters = [
        Semester(name="Fall 2024", start_date=datetime(2024, 9, 1), end_date=datetime(2024, 12, 15), active=False),
        Semester(name="Spring 2025", start_date=datetime(2025, 1, 15), end_date=datetime(2025, 5, 30), active=True),
        Semester(name="Summer 2025", start_date=datetime(2025, 6, 15), end_date=datetime(2025, 8, 30), active=False)
    ]

    for semester in semesters:
        db.session.add(semester)

    db.session.commit()
    print("Semesters created successfully.")
    return semesters

def create_courses(semesters):
    """Create courses, each assigned to a random semester"""
    print("Creating courses...")

    lecturer_profiles = db.session.query(LecturerProfile).all()

    courses_data = [
        {"code": "CS101", "title": "Intro to Computer Science", "program": "Computer Science"},
        {"code": "CS201", "title": "Data Structures", "program": "Computer Science"},
        {"code": "BUS101", "title": "Intro to Business", "program": "Business Administration"},
        {"code": "ENG101", "title": "Engineering Fundamentals", "program": "Engineering"},
        {"code": "MED101", "title": "Human Anatomy", "program": "Medicine"},
        {"code": "ART101", "title": "Intro to Literature", "program": "Arts"},
        {"code": "ART201", "title": "Art History", "program": "Arts"},
        {"code": "ART301", "title": "Art Appreciation", "program": "Arts"},
        {"code":"CS102", "title": "Advanced Computer Science", "program": "Computer Science"},
        {"code":"BUS102", "title": "Advanced Business", "program": "Business Administration"},
        {"code":"ENG102", "title": "Advanced Engineering", "program": "Engineering"},
        {"code":"MED102", "title": "Advanced Medicine", "program": "Medicine"},
        {"code":"ART102", "title": "Advanced Literature", "program": "Arts"},
        {"code":"ART202", "title": "Advanced Art History", "program": "Arts"},
        {"code":"ART302", "title": "Advanced Art Appreciation", "program": "Arts"},
        



    ]

    all_courses = []

    for course_data in courses_data:
        semester = random.choice(semesters)  # assign randomly (or set explicitly)

        matching_lecturers = [lp for lp in lecturer_profiles if lp.department == course_data["program"]]
        lecturer_id = random.choice(matching_lecturers).id if matching_lecturers else None

        course = Course(
            code=course_data["code"],
            title=course_data["title"],
            description=f"Description for {course_data['title']}",
            semester_id=semester.id,
            program=course_data["program"],
            lecturer_id=lecturer_id
        )
        db.session.add(course)
        all_courses.append(course)

    db.session.commit()
    print("Courses created successfully.")
    return all_courses

def create_registrations(students, courses):
    """Create unit registrations for students"""
    print("Creating unit registrations...")

    student_profiles = db.session.query(StudentProfile).all()
    active_semester = db.session.query(Semester).filter_by(active=True).first()

    for student_profile in student_profiles:
        program_courses = [c for c in courses if c.program == student_profile.program and c.semester_id == active_semester.id]
        selected_courses = random.sample(program_courses, min(3, len(program_courses)))

        for course in selected_courses:
            registration = UnitRegistration(
                student_id=student_profile.id,
                course_id=course.id,
                semester_id=active_semester.id,
                registered_on=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.session.add(registration)

    db.session.commit()
    print("Unit registrations created successfully.")

def create_announcements(admin):
    """Create announcements from admin"""
    print("Creating announcements...")

    announcements = [
        {"title": "Welcome Spring 2025", "content": "Classes begin Jan 15. Complete registration by Jan 10.", "days_ago": 15},
        {"title": "Fee Deadline", "content": "Pay by Feb 15 to avoid penalties.", "days_ago": 10},
        {"title": "Maintenance Notice", "content": "Campus maintenance Feb 20-22. Check your email.", "days_ago": 5}
    ]

    for data in announcements:
        announcement = Announcement(
            title=data["title"],
            content=data["content"],
            posted_by_id=admin.id,
            date_posted=datetime.now() - timedelta(days=data["days_ago"])
        )
        db.session.add(announcement)
        db.session.commit()

    print("Announcements created successfully.")

    #Gradings 
    print("Creating grades...")
    grade_options = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"]
    grade_weights = [5, 10, 15, 15, 15, 10, 10, 8, 5, 3, 2, 2]  # Distribution of grades
    
    # Assign each student multiple courses with grades
    for student in students:
        # Each student takes between 3 and 6 random courses
        student_courses = random.sample(courses, random.randint(3, 6))
        
        for course in student_courses:
            # Assign to a random semester
            semester = random.choice(semesters)
            
            # Create a grade entry
            grade = Grade(
                student_id=student.id,
                course_id=course.id,
                grade=random.choices(grade_options, weights=grade_weights)[0],
                semester_id=semester.id,
                date_posted=semester.start_date + timedelta(days=random.randint(10, 90))
            )
            db.session.add(grade)
    db.session.commit()
    print("Student grated successfully.")
    
    #DocumentRequest
def seed_document_requests(num_records=20):
    print("Seeding document requests...")
# Get existing student IDs
    student_users = User.query.filter_by(role='student').all()
    if not student_users:
        print("No student users found in the database!")
        return
    
    student_ids = [student.id for student in student_users]

    document_types = ['Transcript', 'Enrollment Letter', 'Graduation Certificate', 'Recommendation Letter']

    for _ in range(num_records):
        student_id = random.choice(student_ids)
        document_type = random.choice(document_types)
        
        status = random.choice(['Pending', 'Approved', 'Rejected'])
        requested_on = fake.date_time_between(start_date='-30d', end_date='now')
        
        processed_on = None
        if status != 'Pending':
            # processed_on after requested_on by 1-5 days
            processed_on = requested_on + timedelta(days=random.randint(1, 5))
        
        file_name = None
        file_path = None
        if status == 'Approved':
            file_name = f"{document_type.lower().replace(' ', '_')}_{student_id}.pdf"
            file_path = f"/files/{file_name}"

        doc_request = DocumentRequest(
            student_id=student_id,
            document_type=document_type,
            status=status,
            requested_on=requested_on,
            processed_on=processed_on,
            file_name=file_name,
            file_path=file_path
        )

        db.session.add(doc_request)
    
    db.session.commit()
    print(f"Seeded {num_records} DocumentRequest records.")

    #Hostel
def seed_hostels(num_records=10):
    for _ in range(num_records):
        hostel_name = fake.unique.company() + " Hostel"
        location = fake.address().replace("\n", ", ")
        capacity = random.randint(50, 300)

        hostel = Hostel(
            name=hostel_name,
            location=location,
            capacity=capacity
        )

        db.session.add(hostel)
    
    db.session.commit()
    print(f"Seeded {num_records} Hostel records.")

    #Room
def seed_rooms(rooms_per_hostel=10):
    hostels = Hostel.query.all()

    if not hostels:
        print("No hostels found! Please seed hostels first.")
        return

    for hostel in hostels:
        for i in range(rooms_per_hostel):
            room_number = f"{hostel.id}-{i+1:03d}"  
            bed_count = random.randint(1, 6)
            price_per_bed = round(random.uniform(50, 200), 2)

            room = Room(
                hostel_id=hostel.id,
                room_number=room_number,
                bed_count=bed_count,
                price_per_bed=price_per_bed,
                status= random.choice(['Available', 'Occupied','Booked'])  
            )

            db.session.add(room)
    
    db.session.commit()
    print(f"Seeded {len(hostels) * rooms_per_hostel} Room records.")

    #student_booking
def seed_student_room_bookings(num_bookings=20):
    students = StudentProfile.query.all()
    rooms = Room.query.all()

    if not students:
        print("No student profiles found! Please seed students first.")
        return
    if not rooms:
        print("No rooms found! Please seed rooms first.")
        return

    for _ in range(num_bookings):
        student = random.choice(students)
        room = random.choice(rooms)

        start_date = fake.date_between(start_date='-6m', end_date='today')
        end_date = start_date + timedelta(days=random.randint(90, 180))  # 3-6 months duration

        booking = StudentRoomBooking(
            student_id=student.id,
            room_id=room.id,
            start_date=start_date,
            end_date=end_date,
            booked_on=fake.date_time_between(start_date=start_date - timedelta(days=7), end_date=start_date)
        )

        db.session.add(booking)

    db.session.commit()
    print(f"Seeded {num_bookings} student room bookings.")

    #Fee-Structure
def seed_fee_structures(num_entries=20):
    courses = Course.query.all()
    hostels = Hostel.query.all()
    semesters = Semester.query.all()

    if not courses:
        print("No courses found! Please seed courses first.")
        return
    if not hostels:
        print("No hostels found! Please seed hostels first.")
        return
    if not semesters:
        print("No semesters found! Please seed semesters first.")
        return

    for _ in range(num_entries):
        course = random.choice(courses)
        hostel = random.choice(hostels)
        semester = random.choice(semesters)

        amount = round(random.uniform(50000, 150000), 2)  # random fee between 50k - 150k

        fee_structure = FeeStructure(
            course_id=course.id,
            hostel_id=hostel.id,
            semester_id=semester.id,
            amount=amount
        )

        db.session.add(fee_structure)

    db.session.commit()
    print(f"Seeded {num_entries} fee structures.")
    try:
            assignments_data = [
                {
                    'title': 'Math Assignment 1',
                    'description': 'Solve problems 1-10 on page 42.',
                    'due_date': '2025-05-15'
                },
                {
                    'title': 'Physics Project',
                    'description': 'Build a model rocket.',
                    'due_date': '2025-05-20'
                },
                {
                    'title': 'History Essay',
                    'description': 'Write a 3-page essay on World War II.',
                    'due_date': '2025-05-18'
                }
            ]

            for data in assignments_data:
                title = data.get('title')
                description = data.get('description')
                due_date = data.get('due_date')

                # Parse due_date
                due_date_parsed = datetime.strptime(due_date, '%Y-%m-%d')

                new_assignment = Assignment(
                    title=title,
                    description=description,
                    due_date=due_date_parsed
                )

                db.session.add(new_assignment)

            db.session.commit()
            print(f" {len(assignments_data)} assignments seeded successfully.")

    except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"❌ Error seeding assignments: {e}")
                
    #payments
def seed_payments(num_entries=30):
    # Get existing students and fee structures
    students = StudentProfile.query.all()
    fee_structures = FeeStructure.query.all()

    if not students:
        print("❌ No students found. Please seed StudentProfile table first.")
        return
    if not fee_structures:
        print("❌ No fee structures found. Please seed FeeStructure table first.")
        return

    payment_methods = ['Cash', 'M-Pesa', 'Bank Transfer', 'Credit Card']

    for _ in range(num_entries):
        student = random.choice(students)
        fee_structure = random.choice(fee_structures)

        max_amount = fee_structure.amount
        amount_paid = round(random.uniform(max_amount * 0.2, max_amount), 2)  # 20%-100% of total fee

        # Random payment date within last 12 months
        payment_date = fake.date_time_between(start_date='-1y', end_date='now')

        payment_method = random.choice(payment_methods)

        payment = Payment(
            student_id=student.id,
            fee_structure_id=fee_structure.id,
            amount_paid=amount_paid,
            payment_date=payment_date,
            payment_method=payment_method
        )

        db.session.add(payment)

    db.session.commit()
    print(f" Seeded {num_entries} payments successfully!")

    #FeeClearance
def seed_fee_clearances(num_entries=20):
    students = StudentProfile.query.all()

    if not students:
        print("❌ No students found. Please seed StudentProfile table first.")
        return

    statuses = ['Pending', 'Cleared', 'Rejected']

    for _ in range(num_entries):
        student = random.choice(students)

        # Random cleared_on date within last 6 months
        cleared_on = fake.date_time_between(start_date='-6m', end_date='now')

        status = random.choice(statuses)

        clearance = FeeClearance(
            student_id=student.id,
            cleared_on=cleared_on,
            status=status
        )

        db.session.add(clearance)

    db.session.commit()
    print(f" Seeded {num_entries} fee clearance records successfully!")

    #AuditLogs
    
def seed_audit_logs(num_entries=50):
    users = User.query.all()

    if not users:
        print("❌ No users found. Please seed User table first.")
        return

    actions = [
        "Login",
        "Logout",
        "Viewed grades",
        "Updated profile",
        "Requested document",
        "Processed payment",
        "Cleared fee",
        "Booked room",
        "Changed password"
    ]

    for _ in range(num_entries):
        user = random.choice(users)

        action = random.choice(actions)
        timestamp = fake.date_time_between(start_date='-1y', end_date='now')
        details = fake.sentence(nb_words=10)

        log = AuditLog(
            action=action,
            timestamp=timestamp,
            details=details,
            user_id=user.id
        )

        db.session.add(log)

    db.session.commit()
    print(f" Seeded {num_entries} audit logs successfully!")

    #assignments
def seed_assignments():
    try:
        assignments_data = [
            {
                'title': 'Math Assignment 1',
                'description': 'Solve problems 1-10 on page 42.',
                'due_date': '2025-05-15'
            },
            {
                'title': 'Physics Project',
                'description': 'Build a model rocket.',
                'due_date': '2025-05-20'
            },
            {
                'title': 'History Essay',
                'description': 'Write a 3-page essay on World War II.',
                'due_date': '2025-05-18'
            }
        ]

        for data in assignments_data:
            title = data.get('title')
            description = data.get('description')
            due_date = data.get('due_date')

            # Parse due_date
            due_date_parsed = datetime.strptime(due_date, '%Y-%m-%d')

            new_assignment = Assignment(
                title=title,
                description=description,
                due_date=due_date_parsed
            )

            db.session.add(new_assignment)

        db.session.commit()
        print(f"✅ {len(assignments_data)} assignments seeded successfully.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error seeding assignments: {e}")
            
   
if __name__ == "__main__":
    if __name__ == "__main__":
     

     with app.app_context():
         
        db.session.execute(text('DROP TABLE IF EXISTS fee_structures CASCADE'))
        db.session.commit(),
        db.metadata.drop_all(engine)
        db.metadata.create_all(engine)
        admin, students, lecturers = create_users()
        create_profiles(students, lecturers)
        semesters = create_semesters()
        courses = create_courses(semesters)
        create_registrations(students, courses)
        create_announcements(admin)
        seed_document_requests()
        seed_hostels()
        seed_rooms()
        seed_student_room_bookings()
        seed_fee_structures()
        seed_payments()
        seed_fee_clearances()
        seed_audit_logs()
        print("✅ Database seeding complete!")