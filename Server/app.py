import os
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, request, jsonify, Blueprint
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)

from datetime import datetime
from flask_cors import CORS, cross_origin
from datetime import timedelta
from functools import wraps
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from models import db, User, StudentProfile, LecturerProfile, Course, Semester, UnitRegistration,Grade, Announcement, AuditLog, DocumentRequest, Hostel, Room, StudentRoomBooking, FeeStructure, Payment, FeeClearance, Assignment, Registration
from dotenv import load_dotenv



# Flask App Config
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    "postgresql://dashboard:Student@localhost:5432/student_portal"    
)


# Enable CORS for all routes with proper configuration

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_updated_secret_key_here')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-jwt-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create the folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Extensions
load_dotenv()
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
api = Api(app)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


# -------------------- Role-Based Access Decorator --------------------
def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            # Comment out security checks
            user_id = user_id()
            user = User.query.get(user_id)

            if not user:
                return jsonify({"error": "User not found"}), 404
            if user.role != role:
                return jsonify({"error": f"Permission denied. Requires {role} role"}), 403
            
            # Allow the function to proceed without checking permissions
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# -------------------- Auth Resources --------------------
class Register(Resource):
    def post(self):
        try:
            data = request.get_json()
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role')

            if not all([name, email, password, role]):
                return {"error": "Missing required fields"}, 400

            if User.query.filter_by(email=email).first():
                return {"error": "Email already registered"}, 409

            user = User(name=name, email=email, role=role)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()  # to get user.id

            profile_data = data.get(f"{role}_profile", {})

            if role == 'student':
                if StudentProfile.query.filter_by(reg_no=profile_data.get('reg_no')).first():
                    return {"error": f"Student with reg_no {profile_data.get('reg_no')} already exists"}, 409

                student_profile = StudentProfile(
                    user_id=user.id,
                    reg_no=profile_data.get('reg_no'),
                    program=profile_data.get('program'),
                    year_of_study=profile_data.get('year_of_study'),
                    phone=profile_data.get('phone')
                )
                db.session.add(student_profile)
                db.session.commit()
                print(f"Student profile created with ID: {student_profile.id}")

            elif role == 'lecturer':
                if LecturerProfile.query.filter_by(staff_no=profile_data.get('staff_no')).first():
                    return {"error": f"Lecturer with staff_no {profile_data.get('staff_no')} already exists"}, 409

                lecturer_profile = LecturerProfile(
                    user_id=user.id,
                    staff_no=profile_data.get('staff_no'),
                    department=profile_data.get('department'),
                    phone=profile_data.get('phone')
                )
                db.session.add(lecturer_profile)
                db.session.commit()
                print(f"Lecturer profile created with ID: {lecturer_profile.id}")

            return {"message": "User registered successfully"}, 201

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Database error: {str(e)}")
            return {"error": "Internal server error"}, 500
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return {"error": "Internal server error"}, 500

class Login(Resource):
   
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"error": "Invalid credentials"}, 401

        access_token = create_access_token(identity=user.id)       

        return {
            "access_token": "dummy_access_token",  # Hardcoded token since security is commented out
            "user": {
                "id": user.id if user else 1,  # Fallback ID if user not found
                "name": user.name if user else "Unknown",
                "email": user.email if user else email,
                "role": user.role if user else "student"
            },            
        }, 200

class Profile(Resource):
    
    # @jwt_required()
    def get(self):
        # Comment out JWT check and just return a sample profile
        user = User.query.get(get_jwt_identity())
        if not user:
            return {"error": "User not found"}, 404
        
        # Get first user as example or return dummy data
        user = User.query.first()
        if user:
            return user.to_dict(rules=('-password_hash', 'student_profile', 'lecturer_profile')), 200
        else:
            return {"id": 1, "name": "Example User", "email": "example@example.com", "role": "student"}, 200

# -------------------- Admin Resource --------------------
class AdminDashboard(Resource):
    # @role_required('admin')
    def get(self):
        return {"message": "Welcome to the Admin Dashboard!"}, 200

# -------------------- Resource Routes --------------------
api.add_resource(Register, '/api/register')
api.add_resource(Login, '/api/login')
api.add_resource(Profile, '/api/profile')
api.add_resource(AdminDashboard, '/api/admin_dashboard')
# -------------------- API Endpoints --------------------
@app.route('/')
def home():
    return "Welcome to the Student Portal!"
#------------------------------------------------------------------------------------------------------------------------------------------------------
# User Management Routes
@app.route('/api/users', methods=['GET'])
# @role_required('admin')
def get_all_users():
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_data = user.to_dict(rules=('-password_hash',))
            
            # Include profile data based on role
            if user.role == 'student' and user.student_profile:
                user_data.update(user.student_profile.to_dict())
            elif user.role == 'lecturer' and user.lecturer_profile:
                user_data.update(user.lecturer_profile.to_dict())
                
            users_data.append(user_data)
            
        return jsonify({'users': users_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
# @role_required('admin')
def update_user(user_id):
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Update basic user info
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            if User.query.filter(User.email == data['email'], User.id != user_id).first():
                return jsonify({'error': 'Email already in use'}), 400
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            
        # Update profile based on role
        if user.role == 'student':
            profile = user.student_profile or StudentProfile(user_id=user.id)
            if 'reg_no' in data:
                profile.reg_no = data['reg_no']
            if 'program' in data:
                profile.program = data['program']
            if 'year_of_study' in data:
                profile.year_of_study = data['year_of_study']
            if 'phone' in data:
                profile.phone = data['phone']
            db.session.add(profile)
                
        elif user.role == 'lecturer':
            profile = user.lecturer_profile or LecturerProfile(user_id=user.id)
            if 'staff_no' in data:
                profile.staff_no = data['staff_no']
            if 'department' in data:
                profile.department = data['department']
            if 'phone' in data:
                profile.phone = data['phone']
            db.session.add(profile)
            
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
# @role_required('admin')
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Delete associated profile first
        if user.role == 'student' and user.student_profile:
            db.session.delete(user.student_profile)
        elif user.role == 'lecturer' and user.lecturer_profile:
            db.session.delete(user.lecturer_profile)
            
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/programs', methods=['GET'])
def get_programs():
    programs = [
        'Computer Science',
        'Engineering',
        'Business',
        'Medicine',
        'Law',
        'Arts',
        'Science'
    ]
    return jsonify({'programs': programs}), 200


#------------------------------------------------------------------------------------------------------------------------------------------------------

 

@app.route('/api/lecturers', methods=['GET'])
def get_all_lecturers():
    lecturer_profiles = LecturerProfile.query.all()

    lecturers_data = [
        {
            "id": l.id,
            "name": l.user.name  # assuming .user exists and has .name
        } for l in lecturer_profiles
    ]
    print(dir(lecturer_profiles[0]))


    return jsonify({"lecturers": lecturers_data}), 200



@app.route('/api/courses', methods=['GET'])
def get_courses():
    try:
        semester_id = request.args.get('semester_id', type=int)
        program = request.args.get('program', type=str)

        print(f"Received parameters: semester_id={semester_id}, program={program}")

        query = Course.query
        if semester_id:
            query = query.filter_by(semester_id=semester_id)
        if program:
            query = query.filter_by(program=program)

        courses = query.all()
        print(f"Fetched {len(courses)} courses from the database")

        return jsonify([{
            'id': c.id,
            'code': c.code,
            'title': c.title,
            'description': c.description,
            'semester_id': c.semester_id,
            'program': c.program
        } for c in courses])

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Prints more detailed error information
        return jsonify({"error": str(e)}), 500  # Sends the error message in the response


@app.route('/api/courses/<int:course_id>', methods=['PUT'])
# @role_required('admin') 
def update_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    course.code = data.get('code', course.code)
    course.title = data.get('title', course.title)
    course.description = data.get('description', course.description)
    course.semester_id = data.get('semester_id', course.semester_id)
    course.program = data.get('program', course.program)

    try:
        db.session.commit()
        return jsonify(course.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update course', 'details': str(e)}), 500


@app.route('/api/courses/<int:course_id>', methods=['DELETE'])
# @role_required('admin') 
def delete_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404

    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': f'Course {course_id} deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete course', 'details': str(e)}), 500

@app.route('/api/courses', methods=['POST'])
# @role_required('admin')  # Your decorator to ensure only admins can access      
def create_course():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    code = data.get('code')
    title = data.get('title')
    description = data.get('description')
    semester_id = data.get('semester_id')
    program = data.get('program')

    if not all([code, title, semester_id, program]):
        return jsonify({'error': 'Missing required fields'}), 400

    course = Course(
        code=code,
        title=title,
        description=description,
        semester_id=semester_id,
        program=program
    )

    try:
        db.session.add(course)
        db.session.commit()
        return jsonify(course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create course', 'details': str(e)}), 500
# CREATE assignment (POST)
@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    try:
        data = request.get_json()

        title = data.get('title')
        description = data.get('description')
        due_date = data.get('due_date')
        lecturer_id = data.get('lecturer_id')

        if not title or not due_date or not lecturer_id:
            return jsonify({'error': 'Title , Due Date and lecturer id are required'}), 400

        try:
            due_date_parsed = datetime.strptime(due_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid due_date format. Use YYYY-MM-DD'}), 400

        # 🟢 Get submitted_by_id or default to lecturer_id
        submitted_by_id = data.get('submitted_by_id')
        if not submitted_by_id:
            submitted_by_id = lecturer_id

        submitted_by_id = data.get('submitted_by_id')
        if not submitted_by_id:
            submitted_by_id = lecturer_id
        lecturer = User.query.get(lecturer_id)
        if lecturer is None:
            return jsonify({'error': 'Lecturer ID is invalid'}), 400  

        submitted_by = User.query.get(submitted_by_id)
        if submitted_by is None:
            return jsonify({'error':'Submitted By ID is invalid'})   

        # 🟢 Pass submitted_by_id into Assignment constructor
        new_assignment = Assignment(
            title=title,
            description=description,
            due_date=due_date_parsed,
            lecturer_id=lecturer_id,
            submitted_by_id=submitted_by_id
        )

        db.session.add(new_assignment)
        db.session.commit()

        return jsonify({
            'message': 'Assignment created successfully',
            'assignment': new_assignment.to_dict()
        }), 201

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# GET all assignments
@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    try:
        assignments = Assignment.query.all()
        assignments_list = [assignment.to_dict() for assignment in assignments]
        return jsonify({"assignments": assignments_list}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Create a new assignment
@app.route('/api/semesters', methods=['GET'])
def get_active_semester():
    active_semester = Semester.query.filter_by(active=True).first()
    if not active_semester:
        return jsonify({'error': 'No active semester found'}), 404

    return jsonify({
        'id': active_semester.id,
        'name': active_semester.name,
        'start_date': active_semester.start_date.isoformat(),
        'end_date': active_semester.end_date.isoformat(),
        'active': active_semester.active
    })

@app.route('/api/semesters', methods=['POST'])
# @jwt_required()
def create_semester():
    # Comment out security checks
    current_user_id = User
    current_user = User.query.get(User)

    # Only allow access if current user is an admin
    # if not current_user or current_user.role != 'admin':
    #     return jsonify({"message": "Access denied"}), 403

    data = request.get_json()

    # Validate input data
    try:
        name = data['name']
        start_date = datetime.strptime(data['start_date'], "%Y-%m-%dT%H:%M:%S")
        end_date = datetime.strptime(data['end_date'], "%Y-%m-%dT%H:%M:%S")
        active = data['active']
    except KeyError as e:
        return jsonify({"message": f"Missing key: {str(e)}"}), 400
    except ValueError:
        return jsonify({"message": "Invalid date format, use 'YYYY-MM-DDTHH:MM:SS'"}), 400

    new_semester = Semester(
        name=name,
        start_date=start_date,
        end_date=end_date,
        active=active
    )

    db.session.add(new_semester)
    db.session.commit()

    return jsonify({"message": "Semester created successfully", "semester": new_semester.to_dict()}), 201

@app.route('/api/semesters/<int:id>', methods=['PUT'])
# @jwt_required()
def update_semester(id):
    # Comment out security checks
    # current_user_id = get_jwt_identity()
    current_user = User.query.get(User)

    # Only allow access if current user is an admin
    if not current_user or current_user.role != 'admin':
        return jsonify({"message": "Access denied"}), 403

    semester = Semester.query.get(id)
    if not semester:
        return jsonify({"message": "Semester not found"}), 404

    data = request.get_json()

    # Update semester attributes
    semester.name = data.get('name', semester.name)
    semester.start_date = datetime.strptime(data.get('start_date', semester.start_date.isoformat()), "%Y-%m-%dT%H:%M:%S")
    semester.end_date = datetime.strptime(data.get('end_date', semester.end_date.isoformat()), "%Y-%m-%dT%H:%M:%S")
    semester.active = data.get('active', semester.active)

    db.session.commit()

    return jsonify({"message": "Semester updated successfully", "semester": semester.to_dict()}), 200

@app.route('/api/semesters/<int:id>', methods=['DELETE'])
# @jwt_required()
def delete_semester(id):
    # Comment out security checks
    # current_user_id = get_jwt_identity()
    current_user = User.query.get(User)

    # Only allow access if current user is an admin
    if not current_user or current_user.role != 'admin':
        return jsonify({"message": "Access denied"}), 403

    semester = Semester.query.get(id)
    if not semester:
        return jsonify({"message": "Semester not found"}), 404

    # Deleting the semester
    db.session.delete(semester)
    db.session.commit()

    return jsonify({"message": "Semester deleted successfully"}), 200

#unit registraions
@app.route('/api/registration', methods=['GET', 'POST', 'DELETE'])
def registration():
    student_profile = StudentProfile.query.first()
    if not student_profile:
        return jsonify({'error': 'No student profiles in database'}), 404

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        course_code = data.get('course_code')
        semester_id = data.get('semester_id')

        if not course_code or not semester_id:
            return jsonify({'error': 'course_code and semester_id are required'}), 400

        course = Course.query.filter_by(code=course_code).first()
        if not course:
            return jsonify({'error': 'Course not found'}), 404

        existing_registration = UnitRegistration.query.filter_by(
            student_id=student_profile.id,
            course_id=course.id,
            semester_id=semester_id
        ).first()

        if existing_registration:
            return jsonify({'error': 'Already registered for this course in the semester'}), 400

        new_registration = UnitRegistration(
            student_id=student_profile.id,
            course_id=course.id,
            semester_id=semester_id
        )
        db.session.add(new_registration)
        db.session.commit()

        return jsonify({'message': 'Registration successful', 'registration_id': new_registration.id}), 201

    elif request.method == 'GET':
        registrations = UnitRegistration.query.filter_by(student_id=student_profile.id).all()
        results = []
        for reg in registrations:
            results.append({
                'id': reg.id,
                'course_code': reg.course.code,
                'course_title': reg.course.title,
                'semester_id': reg.semester_id,
                'registered_on': reg.registered_on.isoformat() if reg.registered_on else None
            })
        return jsonify(results), 200

    elif request.method == 'DELETE':
        # support either JSON body or query param
        data = request.get_json()
        registration_id = data.get('registration_id') if data else request.args.get('registration_id')

        if not registration_id:
            return jsonify({'error': 'registration_id is required'}), 400

        registration = UnitRegistration.query.filter_by(
            id=registration_id,
            student_id=student_profile.id
        ).first()

        if not registration:
            return jsonify({'error': 'Registration not found'}), 404

        db.session.delete(registration)
        db.session.commit()
        return jsonify({'message': 'Registration deleted successfully'}), 200


# -------------------- Announcements Resource --------------------

@app.route('/api/announcements', methods=['GET', 'POST'])
# @jwt_required(optional=True)
def announcements():
    if request.method == 'GET':
        announcements = Announcement.query.all()
        return jsonify([{
            'title': a.title,
            'content': a.content,
            'date_posted': a.date_posted.isoformat(),
            'posted_by': a.posted_by.name
        } for a in announcements])

    elif request.method == 'POST':
        # Comment out auth checks
        # current_user_id = current_user_id()
        # if not current_user_id:
        #     return jsonify({'error': 'Authentication required'}), 401

        # user = User.query.get(current_user_id)
        # if user.role not in ['admin', 'lecturer']:
        #     return jsonify({'error': 'Only admins and lecturers can post announcements'}), 403
        
        # Use first user for testing
        current_user = User.query.first()
        if not current_user:
            return jsonify({'error': 'No users in database'}), 404
            
        current_user_id = current_user.id

        data = request.get_json()
        title = data.get('title')
        content = data.get('content')

        if not all([title, content]):
            return jsonify({'error': 'Title and content are required'}), 400

        announcement = Announcement(
            title=title,
            content=content,
            posted_by_id=current_user_id
        )
        db.session.add(announcement)
        db.session.commit()
        return jsonify({'message': 'Announcement posted successfully'}), 201

@app.route('/api/announcements/<int:id>', methods=['DELETE'])
# @jwt_required()
def delete_announcement(id):
    # Comment out auth checks
    # current_user_id = current_user_id()
    # user = User.query.get(current_user_id)

    # if user.role not in ['admin', 'lecturer']:
    #     return jsonify({'error': 'Only admins and lecturers can delete announcements'}), 403

    announcement = Announcement.query.get_or_404(id)
    db.session.delete(announcement)
    db.session.commit()
    return jsonify({'message': 'Announcement deleted'}), 200

# -------------------- Audit Logs Resource --------------------
@app.route('/api/audit_logs', methods=['GET'])
# @role_required('admin')
def audit_logs():
    audit_logs = AuditLog.query.all()
    return jsonify([{
        'action': log.action,
        'timestamp': log.timestamp.isoformat(),
        'user_id': log.user_id,
        'details': log.details
    } for log in audit_logs])

# -------------------- Document Requests Resource --------------------
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/document_requests', methods=['GET', 'POST', 'DELETE'])
# @jwt_required()
def handle_document_requests():
    # Comment out auth checks
    # current_user_id = current_user_id()
    # user = User.query.get(current_user_id)
    
    # Use first user for testing
    current_user = User.query.first()
    if not current_user:
        return jsonify({'error': 'No users in database'}), 404
        
    current_user_id = current_user.id

    if request.method == 'GET':
        # Comment out role check
        # if not user or user.role != 'admin':
        #     return jsonify({'error': 'Access denied'}), 403

        requests = DocumentRequest.query.all()
        return jsonify([req.to_dict() for req in requests]), 200
    elif request.method == 'POST':
        data = request.get_json()
        document_type = data.get('document_type')

        if not document_type:
            return jsonify({'error': 'Document type is required'}), 400

        new_request = DocumentRequest(
            student_id=current_user_id,
            document_type=document_type
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({'message': 'Document request submitted successfully'}), 201 
    # -------------------- Hostel and Room Management --------------------

hostel_bp = Blueprint('hostel', __name__)

# Admin decorator (optional, not active)
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Implement your admin logic here
        return f(*args, **kwargs)
    return decorated_function

# === HOSTELS ROUTES ===
@hostel_bp.route('/api/hostels', methods=['GET', 'POST'])
def handle_hostels():
    if request.method == 'GET':
        try:
            hostels = Hostel.query.all()
            return jsonify({
                'hostels': [{
                    'id': hostel.id,
                    'name': hostel.name,
                    'location': hostel.location,
                    'total_rooms': hostel.total_rooms,
                    'status': hostel.status,
                    'created_at': hostel.created_at.isoformat() if hostel.created_at else None
                } for hostel in hostels]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            required_fields = ['name', 'location']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            hostel = Hostel(
                name=data['name'],
                location=data['location'],
                status=data.get('status', 'active'),
                total_rooms=0
            )

            db.session.add(hostel)
            db.session.commit()

            return jsonify({
                'message': 'Hostel created successfully',
                'hostel': {
                    'id': hostel.id,
                    'name': hostel.name,
                    'location': hostel.location,
                    'status': hostel.status
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@hostel_bp.route('/api/hostels/<int:hostel_id>/rooms', methods=['POST'])
def create_room_for_hostel(hostel_id):
    try:
        data = request.get_json()
        hostel = Hostel.query.get(hostel_id)
        if not hostel:
            return jsonify({'error': 'Hostel not found'}), 404

        room = Room(
            hostel_id=hostel_id,
            room_number=data['room_number'],
            capacity=data['capacity'],
            status='available'
        )
        db.session.add(room)
        hostel.total_rooms += 1
        db.session.commit()

        return jsonify({
            'message': 'Room created successfully',
            'room_id': room.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === ROOMS ROUTES ===
@hostel_bp.route('/api/rooms', methods=['GET', 'POST'])
def handle_rooms():
    if request.method == 'GET':
        try:
            rooms = Room.query.all()
            return jsonify({
                'rooms': [{
                    'id': room.id,
                    'hostel_id': room.hostel_id,
                    'room_number': room.room_number,
                    'capacity': room.capacity,
                    'current_occupants': room.current_occupants,
                    'status': room.status,
                    'created_at': room.created_at.isoformat() if room.created_at else None
                } for room in rooms]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            required_fields = ['hostel_id', 'room_number', 'capacity']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            hostel = Hostel.query.get(data['hostel_id'])
            if not hostel:
                return jsonify({'error': 'Hostel not found'}), 404

            room = Room(
                hostel_id=data['hostel_id'],
                room_number=data['room_number'],
                capacity=data['capacity'],
                status=data.get('status', 'available')
            )

            db.session.add(room)
            hostel.total_rooms += 1
            db.session.commit()

            return jsonify({
                'message': 'Room created successfully',
                'room': {
                    'id': room.id,
                    'hostel_id': room.hostel_id,
                    'room_number': room.room_number,
                    'capacity': room.capacity,
                    'status': room.status
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

# === BOOKINGS ROUTES ===
@hostel_bp.route('/api/bookings', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
def handle_bookings():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if request.method == 'GET':
        try:
            bookings = StudentRoomBooking.query.all()
            return jsonify({
                'bookings': [booking.to_dict() for booking in bookings]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    if request.method == 'POST':
        try:
            data = request.get_json()
            required_fields = ['student_id', 'room_id', 'start_date', 'end_date']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            room = Room.query.get(data['room_id'])
            if not room:
                return jsonify({'error': 'Room not found'}), 404

            if room.status != 'available' or room.current_occupants >= room.capacity:
                return jsonify({'error': 'Room is not available'}), 400

            booking = StudentRoomBooking(
                student_id=data['student_id'],
                room_id=data['room_id'],
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d')
            )

            room.current_occupants += 1
            if room.current_occupants >= room.capacity:
                room.status = 'occupied'

            db.session.add(booking)
            db.session.commit()

            return jsonify({
                'message': 'Booking created successfully',
                'booking_id': booking.id
            }), 201

        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


# === SINGLE HOSTEL DETAIL ===
# Hostel Management Routes
@app.route('/api/hostels', methods=['GET', 'POST'])
def handle_hostels():
    if request.method == 'GET':
        try:
            hostels = Hostel.query.all()
            return jsonify({
                'hostels': [{
                    'id': hostel.id,
                    'name': hostel.name,
                    'location': hostel.location,
                    'status': hostel.status,
                    'total_rooms': len(hostel.rooms),
                    'created_at': hostel.created_at.isoformat() if hostel.created_at else None
                } for hostel in hostels]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            required_fields = ['name', 'location']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            hostel = Hostel(
                name=data['name'],
                location=data['location'],
                status=data.get('status', 'active')
            )

            db.session.add(hostel)
            db.session.commit()

            return jsonify({
                'message': 'Hostel created successfully',
                'hostel': {
                    'id': hostel.id,
                    'name': hostel.name,
                    'location': hostel.location,
                    'status': hostel.status
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@app.route('/api/rooms', methods=['GET', 'POST'])
def handle_rooms():
    if request.method == 'GET':
        try:
            rooms = Room.query.all()
            return jsonify({
                'rooms': [{
                    'id': room.id,
                    'hostel_id': room.hostel_id,
                    'room_number': room.room_number,
                    'capacity': room.capacity,
                    'current_occupants': room.current_occupants or 0,
                    'status': room.status,
                    'hostel_name': room.hostel.name if room.hostel else None,
                    'created_at': room.created_at.isoformat() if room.created_at else None
                } for room in rooms]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            required_fields = ['hostel_id', 'room_number', 'capacity']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            # Check if hostel exists
            hostel = Hostel.query.get(data['hostel_id'])
            if not hostel:
                return jsonify({'error': 'Hostel not found'}), 404

            room = Room(
                hostel_id=data['hostel_id'],
                room_number=data['room_number'],
                capacity=data['capacity'],
                status=data.get('status', 'available')
            )

            db.session.add(room)
            db.session.commit()

            return jsonify({
                'message': 'Room created successfully',
                'room': {
                    'id': room.id,
                    'hostel_id': room.hostel_id,
                    'room_number': room.room_number,
                    'capacity': room.capacity,
                    'status': room.status
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@app.route('/api/bookings', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
def handle_bookings():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if request.method == 'GET':
        try:
            bookings = StudentRoomBooking.query.all()
            return jsonify({
                'bookings': [{
                    'id': booking.id,
                    'student_id': booking.student_id,
                    'student_name': booking.student.name if booking.student else None,
                    'room_id': booking.room_id,
                    'room_number': booking.room.room_number if booking.room else None,
                    'hostel_name': booking.room.hostel.name if booking.room and booking.room.hostel else None,
                    'start_date': booking.start_date.isoformat() if booking.start_date else None,
                    'end_date': booking.end_date.isoformat() if booking.end_date else None,
                    'status': booking.status,
                    'created_at': booking.created_at.isoformat() if booking.created_at else None
                } for booking in bookings]
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            required_fields = ['student_id', 'room_id']
            if not all(field in data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            # Check if room exists
            room = Room.query.get(data['room_id'])
            if not room:
                return jsonify({'error': 'Room not found'}), 404

            # Check if room is available
            if room.status != 'available' or (room.current_occupants and room.current_occupants >= room.capacity):
                return jsonify({'error': 'Room is not available'}), 400

            # Create booking
            booking = StudentRoomBooking(
                student_id=data['student_id'],
                room_id=data['room_id'],
                start_date=datetime.utcnow(),
                status='confirmed'
            )

            # Update room occupancy
            room.current_occupants = (room.current_occupants or 0) + 1
            if room.current_occupants >= room.capacity:
                room.status = 'occupied'

            db.session.add(booking)
            db.session.commit()

            return jsonify({
                'message': 'Booking created successfully',
                'booking': {
                    'id': booking.id,
                    'student_id': booking.student_id,
                    'room_id': booking.room_id,
                    'status': booking.status
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@app.route('/api/hostels/<int:hostel_id>', methods=['GET', 'PUT', 'DELETE'])
def single_hostel(hostel_id):
    hostel = Hostel.query.get_or_404(hostel_id)

    if request.method == 'GET':
        return jsonify({
            'hostel': {
                'id': hostel.id,
                'name': hostel.name,
                'location': hostel.location,
                'status': hostel.status,
                'rooms': [{
                    'id': room.id,
                    'room_number': room.room_number,
                    'capacity': room.capacity,
                    'status': room.status
                } for room in hostel.rooms]
            }
        }), 200

    elif request.method == 'PUT':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            if 'name' in data:
                hostel.name = data['name']
            if 'location' in data:
                hostel.location = data['location']
            if 'status' in data:
                hostel.status = data['status']

            db.session.commit()
            return jsonify({'message': 'Hostel updated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            # Check if hostel has rooms
            if hostel.rooms:
                return jsonify({'error': 'Cannot delete hostel with existing rooms'}), 400

            db.session.delete(hostel)
            db.session.commit()
            return jsonify({'message': 'Hostel deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
@app.route('/api/hostels', methods=['POST'])
def create_hostel():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        name = data.get('name')
        location = data.get('location')
        status = data.get('status', 'active')  # default to active

        if not name or not location:
            return jsonify({'error': 'Name and location are required'}), 400

        new_hostel = Hostel(name=name, location=location, status=status)
        db.session.add(new_hostel)
        db.session.commit()

        return jsonify({
            'message': 'Hostel created successfully',
            'hostel': {
                'id': new_hostel.id,
                'name': new_hostel.name,
                'location': new_hostel.location,
                'status': new_hostel.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/rooms/<int:room_id>', methods=['GET', 'PUT', 'DELETE'])
def single_room(room_id):
    room = Room.query.get_or_404(room_id)

    if request.method == 'GET':
        return jsonify({
            'room': {
                'id': room.id,
                'hostel_id': room.hostel_id,
                'room_number': room.room_number,
                'capacity': room.capacity,
                'current_occupants': room.current_occupants or 0,
                'status': room.status,
                'hostel_name': room.hostel.name if room.hostel else None
            }
        }), 200

    elif request.method == 'PUT':
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            if 'room_number' in data:
                room.room_number = data['room_number']
            if 'capacity' in data:
                room.capacity = data['capacity']
            if 'status' in data:
                room.status = data['status']

            db.session.commit()
            return jsonify({'message': 'Room updated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            # Check if room has bookings
            if room.bookings:
                return jsonify({'error': 'Cannot delete room with existing bookings'}), 400

            db.session.delete(room)
            db.session.commit()
            return jsonify({'message': 'Room deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
        
@app.route('/api/rooms', methods=['POST'])
def create_room():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        room_number = data.get('room_number')
        capacity = data.get('capacity')
        hostel_id = data.get('hostel_id')
        status = data.get('status', 'available')  # default to available

        if not room_number or not capacity or not hostel_id:
            return jsonify({'error': 'room_number, capacity, and hostel_id are required'}), 400

        # Ensure hostel exists
        hostel = Hostel.query.get(hostel_id)
        if not hostel:
            return jsonify({'error': 'Hostel not found'}), 404

        new_room = Room(
            room_number=room_number,
            capacity=int(capacity),
            hostel_id=hostel_id,
            status=status
        )
        db.session.add(new_room)
        db.session.commit()

        return jsonify({
            'message': 'Room created successfully',
            'room': {
                'id': new_room.id,
                'room_number': new_room.room_number,
                'capacity': new_room.capacity,
                'status': new_room.status,
                'hostel_id': new_room.hostel_id
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#--------------------------------------------------------------------------hostles story above
#POST /api/payments - create a new payment
@app.route('/api/payments', methods=['GET'])
def fetch_payments():
    Payments = Payment.query.all()

    if not Payments:
        return jsonify({'error': 'No payments found'}), 404

    result = []
    for p in Payments:
        result.append({
            'id': p.id,
            'student_id': p.student_id,
            'amount': float(p.amount_paid),
            'date': p.payment_date.strftime('%Y-%m-%d'),
            'method': p.payment_method
        })

    return jsonify({'payments': result}), 200

grades_bp = Blueprint('grades', __name__, url_prefix='/api/grades')

# Helper function to validate grades
def is_valid_grade(grade):
    valid_grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E']
    return grade.upper() in valid_grades

@grades_bp.route('/', methods=['GET'])
def get_grades():
    try:
        grades = Grade.query.all()
        return jsonify([{
            'id': grade.id,
            'student_id': grade.student_id,
            'course_id': grade.course_id,
            'semester_id': grade.semester_id,
            'grade': grade.grade,
            'date_posted': grade.date_posted.isoformat(),
            'student_name': grade.student.name,
            'course_name': grade.course.title,
            'semester_name': grade.semester.name
        } for grade in grades]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@grades_bp.route('/', methods=['POST'])
def create_grade():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['student_id', 'course_id', 'semester_id', 'grade']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate grade format
    if not is_valid_grade(data['grade']):
        return jsonify({
            'error': 'Invalid grade. Valid grades are: A, B+, B, C+, C, D+, D, E'
        }), 400
    
    try:
        # Check if student exists
        student = User.query.get(data['student_id'])
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Check if course exists
        course = Course.query.get(data['course_id'])
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Check if semester exists
        semester = Semester.query.get(data['semester_id'])
        if not semester:
            return jsonify({'error': 'Semester not found'}), 404
        
        # Check for duplicate grade entry
        existing_grade = Grade.query.filter_by(
            student_id=data['student_id'],
            course_id=data['course_id'],
            semester_id=data['semester_id']
        ).first()
        
        if existing_grade:
            return jsonify({
                'error': 'Grade already exists for this student, course, and semester'
            }), 409
        
        # Create new grade
        new_grade = Grade(
            student_id=data['student_id'],
            course_id=data['course_id'],
            semester_id=data['semester_id'],
            grade=data['grade'].upper()
        )
        
        db.session.add(new_grade)
        db.session.commit()
        
        return jsonify({
            'message': 'Grade submitted successfully',
            'grade': {
                'id': new_grade.id,
                'student_id': new_grade.student_id,
                'course_id': new_grade.course_id,
                'semester_id': new_grade.semester_id,
                'grade': new_grade.grade,
                'date_posted': new_grade.date_posted.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Additional routes needed for the frontend
@grades_bp.route('/api/students', methods=['GET'])
def get_students():
    try:
        students = User.query.filter_by(role='student').all()
        return jsonify([{
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'reg_no': student.reg_no
        } for student in students]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@grades_bp.route('/courses', methods=['GET'])
def get_courses():
    try:
        courses = Course.query.all()
        return jsonify([{
            'id': course.id,
            'code': course.code,
            'title': course.title,
            'credits': course.credits
        } for course in courses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@grades_bp.route('/api/semesters/active', methods=['GET'])
def get_active_semesters():
    try:
        active_semesters = Semester.query.filter_by(active=True).all()
        return jsonify([{
            'id': semester.id,
            'name': semester.name,
            'year': semester.year,
            'term': semester.term,
            'start_date': semester.start_date.isoformat(),
            'end_date': semester.end_date.isoformat(),
            'active': semester.active
        } for semester in active_semesters]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    # Mock database - replace with your actual database operations
registrations_db = []
users_db = {
    "admin@university.edu": {
        "adminpass": "admin123",
        "role": "admin"
    }
}

@app.route('/api/admin/pending-registrations', methods=['GET'])
@jwt_required()
def get_pending_registrations():
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if users_db.get(current_user, {}).get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Filter pending registrations (status = 'pending')
    pending_regs = [reg for reg in registrations_db if reg['status'] == 'pending']
    
    return jsonify({
        "registrations": pending_regs
    })

@app.route('/api/admin/approve-registration/<registration_id>', methods=['PUT'])
@jwt_required()
def approve_registration(registration_id):
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if users_db.get(current_user, {}).get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Find and update registration
    for reg in registrations_db:
        if reg['id'] == registration_id:
            reg['status'] = 'approved'
            reg['approved_by'] = current_user
            reg['approved_at'] = datetime.utcnow().isoformat()
            return jsonify({"message": "Registration approved"})
        
    # Find and update registration
    for reg in registrations_db:
        if reg['id'] == registration_id:
            reg['status'] = 'approved'
            reg['approved_by'] = current_user
            reg['approved_at'] = datetime.utcnow().isoformat()
            return jsonify({"message": "Registration approved"})
    
    return jsonify({"error": "Registration not found"}), 404

@app.route('/api/admin/reject-registration/<registration_id>', methods=['PUT'])
@jwt_required()
def reject_registration(registration_id):
    current_user = get_jwt_identity()
    reason = request.json.get('reason')
    
    if not reason:
        return jsonify({"error": "Reason is required"}), 400
    
    # Check if user is admin
    if users_db.get(current_user, {}).get('role') != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Find and update registration
    for reg in registrations_db:
        if reg['id'] == registration_id:
            reg['status'] = 'rejected'
            reg['rejected_by'] = current_user
            reg['rejected_at'] = datetime.utcnow().isoformat()
            reg['rejection_reason'] = reason
            return jsonify({"message": "Registration rejected"})
    
    return jsonify({"error": "Registration not found"}), 404

# Sample registration data for testing
sample_registration = {
    "id": "reg123",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "student_id": "STU001",
    "program_name": "Computer Science",
    "department": "Engineering",
    "batch_year": "2023",
    "submitted_at": datetime.utcnow().isoformat(),
    "status": "pending"
}
registrations_db.append(sample_registration)



# @app.route('/api/admin/reject-registration/<registration_id>', methods=['PUT'])
# @jwt_required()
# def reject_registration(registration_id):
#     current_user = get_jwt_identity()
#     reason = request.json.get('reason')
    
#     if not reason:
#         return jsonify({"error": "Reason is required"}), 400
    
#     # Check if user is admin
#     if users_db.get(current_user, {}).get('role') != 'admin':
#         return jsonify({"error": "Unauthorized"}), 403
    
#     # Find and update registration
#     for reg in registrations_db:
#         if reg['id'] == registration_id:
#             reg['status'] = 'rejected'
#             reg['rejected_by'] = current_user
#             reg['rejected_at'] = datetime.utcnow().isoformat()
#             reg['rejection_reason'] = reason
#             return jsonify({"message": "Registration rejected"})
    
#     return jsonify({"error": "Registration not found"}), 404

# Sample registration data for testing
sample_registration = {
    "id": "reg123",
    "student_name": "John Doe",
    "student_email": "john@example.com",
    "student_id": "STU001",
    "program_name": "Computer Science",
    "department": "Engineering",
    "batch_year": "2023",
    "submitted_at": datetime.utcnow().isoformat(),
    "status": "pending"
}
registrations_db.append(sample_registration)

#fee_clearance 
@app.route('/api/clearance', methods=['GET'])
def get_clearance_status():
    # Get student_id from query parameters instead of JWT
    student_id = request.args.get('student_id')
    if not student_id:
        return jsonify({'success': False, 'message': 'Student ID is required'}), 400
    
    clearance_status = FeeClearance.query.filter_by(student_id=student_id).first()
    if clearance_status:
        return jsonify({'success': True, 'data': clearance_status.to_dict()}), 200
    else:
        return jsonify({'success': False, 'message': 'Clearance status not found'}), 404

@app.route('/admin/clearance/<int:student_id>', methods=['GET'])
def change_clearance_status(student_id):
    clearance_status = FeeClearance.query.filter_by(student_id=student_id).first()
    if not clearance_status:
        return jsonify({'success': False, 'message': 'Clearance status not found'}), 404
    
    data = request.get_json()
    
    # Only update what's in the model
    if 'status' in data:
        clearance_status.status = data['status']
    
    if 'cleared_on' in data:
        try:
            clearance_status.cleared_on = datetime.fromisoformat(data['cleared_on'])
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400

    db.session.commit()
    return jsonify({'success': True, 'data': clearance_status.to_dict()}), 200
    
@app.route('/api/admin/clearance', methods=['GET'])
def get_all_clearance_statuses():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        clearances = FeeClearance.query.all()
        return jsonify({
            'success': True,
            'clearances': [{
                'student_id': c.student_id,
                'student_name': c.student_name,
                'program': c.program,
                'amount_due': c.amount_due,
                'status': c.status,
                'cleared_on': c.cleared_on.isoformat() if c.cleared_on else None
            } for c in clearances]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin/clearance/<int:student_id>', methods=['PUT', 'OPTIONS'])
def update_clearance_status(student_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        clearance = FeeClearance.query.filter_by(student_id=student_id).first()
        if not clearance:
            return jsonify({'success': False, 'message': 'Clearance status not found'}), 404

        data = request.get_json()
        
        # Update status if provided
        if 'status' in data:
            clearance.status = data['status']
        
        # Update cleared_on if status is cleared
        if clearance.status == 'cleared':
            clearance.cleared_on = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'student_id': clearance.student_id,
                'status': clearance.status,
                'cleared_on': clearance.cleared_on.isoformat() if clearance.cleared_on else None
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    
def create_fee_routes(app):

    # Helper decorator for admin authentication
    def admin_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Implement your admin authentication logic here
            # For example, check JWT token or session
            if not request.headers.get('X-Admin-Auth'):
                return jsonify({'success': False, 'message': 'Admin access required'}), 403
            return f(*args, **kwargs)
        return decorated_function

    @app.route('/api/admin/clearance', methods=['GET'])
    @admin_required
    def get_all_clearance_statuses():
        try:
            # Get optional query parameters for filtering
            status_filter = request.args.get('status')
            search_query = request.args.get('search')
            
            query = FeeClearance.query
            
            # Apply status filter if provided
            if status_filter and status_filter != 'all':
                query = query.filter(FeeClearance.status == status_filter)
            
            # Apply search filter if provided
            if search_query:
                search = f"%{search_query}%"
                query = query.filter(
                    (FeeClearance.student_id.cast(db.String).ilike(search)) |
                    (FeeClearance.student_name.ilike(search)) |
                    (FeeClearance.program.ilike(search))
                )
            
            clearances = query.order_by(FeeClearance.student_id).all()
            
            return jsonify({
                'success': True,
                'clearances': [{
                    'student_id': c.student_id,
                    'student_name': c.student_name,
                    'program': c.program,
                    'amount_due': float(c.amount_due) if c.amount_due else 0.0,
                    'status': c.status,
                    'cleared_on': c.cleared_on.isoformat() if c.cleared_on else None
                } for c in clearances],
                'stats': {
                    'total': len(clearances),
                    'cleared': len([c for c in clearances if c.status == 'cleared']),
                    'pending': len([c for c in clearances if c.status == 'pending']),
                    'flagged': len([c for c in clearances if c.status == 'flagged'])
                }
            }), 200
            
        except Exception as e:
            app.logger.error(f"Error fetching clearance data: {str(e)}")
            return jsonify({'success': False, 'message': 'Error fetching clearance data'}), 500

    @app.route('/admin/clearance/<int:student_id>', methods=['PUT'])
    @admin_required
    def update_clearance_status(student_id):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'success': False, 'message': 'No data provided'}), 400
            
            clearance = FeeClearance.query.filter_by(student_id=student_id).first()
            if not clearance:
                return jsonify({'success': False, 'message': 'Clearance record not found'}), 404
            
            # Update status if provided
            if 'status' in data:
                new_status = data['status'].lower()
                if new_status not in ['cleared', 'pending', 'flagged']:
                    return jsonify({'success': False, 'message': 'Invalid status value'}), 400
                
                clearance.status = new_status
                
                # Automatically set cleared_on date when status is set to cleared
                if new_status == 'cleared' and not clearance.cleared_on:
                    clearance.cleared_on = datetime.utcnow()
                elif new_status != 'cleared':
                    clearance.cleared_on = None
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Clearance status updated successfully',
                'data': {
                    'student_id': clearance.student_id,
                    'status': clearance.status,
                    'cleared_on': clearance.cleared_on.isoformat() if clearance.cleared_on else None
                }
            }), 200
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error updating clearance status: {str(e)}")
            return jsonify({'success': False, 'message': 'Error updating clearance status'}), 500

    @app.route('/api/clearance/<int:student_id>', methods=['GET'])
    def get_clearance_status(student_id):
        """Public endpoint to check clearance status (used by students)"""
        try:
            clearance = FeeClearance.query.filter_by(student_id=student_id).first()
            if not clearance:
                return jsonify({'success': False, 'message': 'Clearance record not found'}), 404
            
            return jsonify({
                'success': True,
                'data': {
                    'student_id': clearance.student_id,
                    'student_name': clearance.student_name,
                    'status': clearance.status,
                    'amount_due': float(clearance.amount_due) if clearance.amount_due else 0.0,
                    'cleared_on': clearance.cleared_on.isoformat() if clearance.cleared_on else None
                }
            }), 200
            
        except Exception as e:
            app.logger.error(f"Error fetching clearance status: {str(e)}")
            return jsonify({'success': False, 'message': 'Error fetching clearance status'}), 500

    @app.route('/api/admin/clearance/stats', methods=['GET'])
    @admin_required
    def get_clearance_stats():
        """Endpoint specifically for dashboard statistics"""
        try:
            clearances = FeeClearance.query.all()
            
            return jsonify({
                'success': True,
                'stats': {
                    'total': len(clearances),
                    'cleared': len([c for c in clearances if c.status == 'cleared']),
                    'pending': len([c for c in clearances if c.status == 'pending']),
                    'flagged': len([c for c in clearances if c.status == 'flagged']),
                    'total_amount_due': sum(float(c.amount_due) for c in clearances if c.amount_due)
                }
            }), 200
            
        except Exception as e:
            app.logger.error(f"Error fetching clearance stats: {str(e)}")
            return jsonify({'success': False, 'message': 'Error fetching statistics'}), 500

#-------------------------------------------------------------------------------------------------------------------------------------------
    admin_bp = Blueprint('admin', __name__)

    @admin_bp.route('/admin/pending-registrations', methods=['GET'])
    def get_pending_registrations():
        pending = Registration.query.filter_by(status='pending').all()
        registrations = [{
            'id': reg.id,
            'student_name': reg.student_name,
            'student_email': reg.student_email,
            'student_id': reg.student_id,
            'program_name': reg.program_name,
            'department': reg.department,
            'batch_year': reg.batch_year,
            'submitted_at': reg.submitted_at
        } for reg in pending]
        
        return jsonify(registrations=registrations), 200

    @admin_bp.route('/admin/approve-registration/<int:registration_id>', methods=['PUT'])
    def approve_registration(registration_id):
        reg = Registration.query.get_or_404(registration_id)
        
        if reg.status != 'pending':
            return jsonify({'error': 'Registration is not pending'}), 400
        
        reg.status = 'approved'
        db.session.commit()
        
        return jsonify({'message': 'Registration approved'}), 200

    @admin_bp.route('/admin/reject-registration/<int:registration_id>', methods=['PUT'])
    def reject_registration(registration_id):
        data = request.get_json()
        reason = data.get('reason')
        
        if not reason:
            return jsonify({'error': 'Rejection reason is required'}), 400

        reg = Registration.query.get_or_404(registration_id)
        
        if reg.status != 'pending':
            return jsonify({'error': 'Registration is not pending'}), 400
        
        reg.status = 'rejected'
        reg.rejection_reason = reason  # Make sure this column exists in your model
        db.session.commit()
        
        return jsonify({'message': 'Registration rejected'}), 200

# Get all fee structures
@app.route('/api/fee-structures/', methods=['GET'])

def get_all_fee_structures():
    fee_structures = FeeStructure.query.all()
    return jsonify([fs.to_dict() for fs in fee_structures]), 200

# Get a specific fee structure by ID
@app.route('/api/fee-structures/<int:id>', methods=['GET'])

def get_fee_structure(id):
    fs = FeeStructure.query.get_or_404(id)
    return jsonify(fs.to_dict()), 200

# Create a new fee structure
@app.route('/api/fee-structures/', methods=['POST'])

def create_fee_structure():
    data = request.get_json()
    try:
        fs = FeeStructure(
            course_id=data['course_id'],
            hostel_id=data['hostel_id'],
            semester_id=data['semester_id'],
            amount=data['amount']
        )
        db.session.add(fs)
        db.session.commit()
        return jsonify(fs.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Update a fee structure
@app.route('/api/fee-structures/<int:id>', methods=['PUT'])

def update_fee_structure(id):
    fs = FeeStructure.query.get_or_404(id)
    data = request.get_json()
    try:
        fs.course_id = data.get('course_id', fs.course_id)
        fs.hostel_id = data.get('hostel_id', fs.hostel_id)
        fs.semester_id = data.get('semester_id', fs.semester_id)
        fs.amount = data.get('amount', fs.amount)
        db.session.commit()
        return jsonify(fs.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Delete a fee structure
@app.route('/api/fee-structures/<int:id>', methods=['DELETE'])
def delete_fee_structure(id):
    fs = FeeStructure.query.get_or_404(id)
    try:
        db.session.delete(fs)
        db.session.commit()
        return jsonify({'message': 'Fee structure deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/admin/assign_lecturer', methods=['POST']) 
def assign_lecturer_to_course():
    data = request.get_json()
    course_id = data.get('course_id')
    lecturer_id = data.get('lecturer_id')

    course = Course.query.get(course_id)
    lecturer = LecturerProfile.query.get(lecturer_id)

    if not course or not lecturer:
        return jsonify({'error': 'Invalid course or lecturer ID'}), 404

    course.lecturer_id = lecturer.id
    db.session.commit()

    return jsonify({'message': 'Lecturer assigned successfully', 'course': course.to_dict()})


#......................................
if __name__ == '__main__':
    app.run(debug=True)