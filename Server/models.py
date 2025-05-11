
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
db = SQLAlchemy()

# -------------------- Course Prerequisite Table --------------------

course_prerequisites = db.Table(
    'course_prerequisites',
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id')),
    db.Column('prerequisite_id', db.Integer, db.ForeignKey('courses.id'))
)

# -------------------- User Model --------------------

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    student_profile = db.relationship('StudentProfile', back_populates='user', uselist=False)
    grades = db.relationship('Grade', back_populates='student')
    lecturer_profile = db.relationship('LecturerProfile', back_populates='user', uselist=False)
    announcements = db.relationship('Announcement', back_populates='posted_by')
    audit_logs = db.relationship('AuditLog', back_populates='user')
    document_requests = db.relationship('DocumentRequest', back_populates='student')
    
     # Relationship for assignments where the user is the lecturer
    assignments = db.relationship(
        'Assignment',
        back_populates='lecturer',
        foreign_keys='Assignment.lecturer_id'
    )

    # Relationship for assignments submitted by the user
    submitted_assignments = db.relationship(
        'Assignment',
        back_populates='submitted_by',
        foreign_keys='Assignment.submitted_by_id'
    )
    serialize_rules = ('id', 'name', 'email', 'role')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, rules=()):
        # Handle exclusion rules (fields prefixed with '-')
        exclude_fields = {rule[1:] for rule in rules if rule.startswith('-')}
        include_fields = {rule for rule in rules if not rule.startswith('-')}

        # Build the dictionary
        user_dict = {}
        for field in self.__table__.columns.keys():
            if field not in exclude_fields:
                user_dict[field] = getattr(self, field)

        # Add relationships if explicitly included
        if 'student_profile' in include_fields and hasattr(self, 'student_profile'):
            user_dict['student_profile'] = self.student_profile.to_dict() if self.student_profile else None
        if 'lecturer_profile' in include_fields and hasattr(self, 'lecturer_profile'):
            user_dict['lecturer_profile'] = self.lecturer_profile.to_dict() if self.lecturer_profile else None

        return user_dict

# -------------------- StudentProfile Model --------------------

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    id = db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reg_no = db.Column(db.String(50), nullable=False, unique=True)
    program = db.Column(db.String(100), nullable=False)
    year_of_study = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(20))

    user = db.relationship('User', back_populates='student_profile')
    unit_registrations = db.relationship('UnitRegistration', back_populates='student')
    room_bookings = db.relationship('StudentRoomBooking', back_populates='student')
    payments = db.relationship('Payment', back_populates='student')
    fee_clearance = db.relationship('FeeClearance', back_populates='student')


    serialize_rules = ('id', 'reg_no', 'program', 'year_of_study', 'phone')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {field: getattr(self, field) for field in rules}


# -------------------- LecturerProfile Model --------------------

class LecturerProfile(db.Model):
    __tablename__ = 'lecturer_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    staff_no = db.Column(db.String(50), nullable=False, unique=True)
    department = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))

    user = db.relationship('User', back_populates='lecturer_profile')
    courses = db.relationship('Course', back_populates='lecturer')  # NEW

    serialize_rules = ('id', 'staff_no', 'department', 'phone')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {field: getattr(self, field) for field in rules}

# -------------------- Course Model --------------------

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'), nullable=False)
    program = db.Column(db.String(50), nullable=False)

    lecturer_id = db.Column(db.Integer, db.ForeignKey('lecturer_profiles.id'))  # NEW

    lecturer = db.relationship('LecturerProfile', back_populates='courses')     # NEW
    semester = db.relationship('Semester', back_populates='courses')
    grades = db.relationship('Grade', back_populates='course')
    unit_registrations = db.relationship('UnitRegistration', back_populates='course')
    fee_structures = db.relationship('FeeStructure', back_populates='course')

    # Prerequisite logic (unchanged)
    prerequisites = db.relationship(
        'Course',
        secondary='course_prerequisites',
        primaryjoin='Course.id==course_prerequisites.c.course_id',
        secondaryjoin='Course.id==course_prerequisites.c.prerequisite_id',
        back_populates='dependent_courses'
    )
    dependent_courses = db.relationship(
        'Course',
        secondary='course_prerequisites',
        primaryjoin='Course.id==course_prerequisites.c.prerequisite_id',
        secondaryjoin='Course.id==course_prerequisites.c.course_id',
        back_populates='prerequisites'
    )

    serialize_rules = ('id', 'code', 'title', 'description', 'semester_id', 'program', 'lecturer_id')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        course_dict = {field: getattr(self, field) for field in rules}
        if 'lecturer' in rules and self.lecturer:
            course_dict['lecturer'] = self.lecturer.to_dict()
        return course_dict


# -------------------- Semester Model --------------------

class Semester(db.Model):
    __tablename__ = 'semesters'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    active = db.Column(db.Boolean, default=False)

    courses = db.relationship('Course', back_populates='semester')
    grades = db.relationship('Grade', back_populates='semester')
    unit_registrations = db.relationship('UnitRegistration', back_populates='semester')
    fee_structures = db.relationship('FeeStructure', back_populates='semester')


    serialize_rules = ('id', 'name', 'start_date', 'end_date', 'active')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'name': self.name,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'active': self.active
        }


# -------------------- UnitRegistration Model --------------------

class UnitRegistration(db.Model):
    __tablename__ = 'unit_registrations'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'), nullable=False)
    registered_on = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('StudentProfile', back_populates='unit_registrations')
    course = db.relationship('Course', back_populates='unit_registrations')
    semester = db.relationship('Semester', back_populates='unit_registrations')

    serialize_rules = ('id', 'student_id', 'course_id', 'course_code', 'course_title', 'semester_id', 'registered_on')

    @staticmethod
    def is_already_registered(student_id, course_id, semester_id):
        return db.session.query(UnitRegistration).filter_by(
            student_id=student_id,
            course_id=course_id,
            semester_id=semester_id
        ).first() is not None

    @staticmethod
    def check_prerequisites_met(student_id, course):
        
        if not course.prerequisites:
            return True  # No prerequisites required

        completed_course_ids = {
            reg.course_id for reg in UnitRegistration.query.filter_by(student_id=student_id)
        }

        required_prereq_ids = {prereq.id for prereq in course.prerequisites}
        return required_prereq_ids.issubset(completed_course_ids)

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'course_code': self.course.code,
            'course_title': self.course.title,
            'semester_id': self.semester_id,
            'registered_on': self.registered_on.isoformat()
        }




class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    grade = db.Column(db.String(2), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'), nullable=False)
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', back_populates='grades')
    course = db.relationship('Course', back_populates='grades')
    semester = db.relationship('Semester', back_populates='grades')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'course_code': self.course.code,
            'course_title': self.course.title,
            'grade': self.grade,
            'semester': self.semester.name,
            'date_posted': self.date_posted.isoformat() if self.date_posted else None
        }

    
class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)
    posted_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    posted_by = db.relationship('User', back_populates='announcements')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'date_posted': self.date_posted.isoformat() if self.date_posted else None,
            'posted_by': self.posted_by.name
        }
 

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='audit_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'details': self.details,
            'user': self.user.name
        }


class DocumentRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_type = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='Pending')
    requested_on = db.Column(db.DateTime, default=datetime.utcnow)
    processed_on = db.Column(db.DateTime)

    # NEW fields for file upload
    file_name = db.Column(db.String(255))
    file_path = db.Column(db.String(255))

    student = db.relationship('User', back_populates='document_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'document_type': self.document_type,
            'status': self.status,
            'requested_on': self.requested_on.isoformat() if self.requested_on else None,
            'processed_on': self.processed_on.isoformat() if self.processed_on else None,
            'file_name': self.file_name,
            'file_path': self.file_path
        }

# -------------------- Hostel and Accommodation Models --------------------

class Hostel(db.Model):
    __tablename__ = 'hostels'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    rooms = db.relationship('Room', back_populates='hostel')  
    status = db.Column(db.String(50), default='Active') 
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
    fee_structures = db.relationship('FeeStructure', back_populates='hostel')

    serialize_rules = ('id', 'name', 'location', 'capacity')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {field: getattr(self, field) for field in rules}

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    hostel_id = db.Column(db.Integer, db.ForeignKey('hostels.id'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    bed_count = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer)
    price_per_bed = db.Column(db.Float, nullable=False)
    current_occupants = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='Available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    hostel = db.relationship('Hostel', back_populates='rooms')
    student_bookings = db.relationship('StudentRoomBooking', back_populates='room')

    serialize_rules = ('id', 'hostel_id', 'room_number', 'bed_count', 'price_per_bed')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {field: getattr(self, field) for field in rules}


class StudentRoomBooking(db.Model):
    __tablename__ = 'student_room_bookings'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    booked_on = db.Column(db.DateTime, default=datetime.utcnow)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    student = db.relationship('StudentProfile', back_populates='room_bookings')
    room = db.relationship('Room', back_populates='student_bookings')

    serialize_rules = ('id', 'student_id', 'room_id', 'start_date', 'end_date', 'booked_on')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'student_id': self.student_id,
            'room_number': self.room.room_number,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'booked_on': self.booked_on.isoformat()
        }


# -------------------- Fee Structure Models --------------------

class FeeStructure(db.Model):
    __tablename__ = 'fee_structures'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    hostel_id = db.Column(db.Integer, db.ForeignKey('hostels.id'), nullable=False)
    semester_id = db.Column(db.Integer, db.ForeignKey('semesters.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    
    course = db.relationship('Course', back_populates='fee_structures')
    hostel = db.relationship('Hostel', back_populates='fee_structures')
    semester = db.relationship('Semester', back_populates='fee_structures')
    payments = db.relationship('Payment', back_populates='fee_structure')

    serialize_rules = ('id', 'course', 'hostel', 'semester', 'amount', 'payments')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
        'id': self.id,
        'course_id': self.course_id,
        'hostel_id': self.hostel_id,
        'semester_id': self.semester_id,
        'amount': self.amount,
        'course': self.course.to_dict() if self.course else None,
        'hostel': self.hostel.to_dict() if self.hostel else None,
        'semester': self.semester.to_dict() if self.semester else None
    }

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    fee_structure_id = db.Column(db.Integer, db.ForeignKey('fee_structures.id'), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), nullable=False)

    student = db.relationship('StudentProfile', back_populates='payments')
    fee_structure = db.relationship('FeeStructure', back_populates='payments')

    serialize_rules = ('id', 'student_id', 'amount_paid', 'payment_date', 'payment_method', 'fee_structure')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'student_id': self.student_id,
            'fee_structure': self.fee_structure.to_dict(rules=('course', 'hostel', 'semester', 'amount')),
            'amount_paid': self.amount_paid,
            'payment_date': self.payment_date.isoformat(),
            'payment_method': self.payment_method
        }


class FeeClearance(db.Model):
    __tablename__ = 'fee_clearances'

    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100))
    amount_due = db.Column(db.Float, default=0.0)
    program = db.Column(db.String(100))
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    cleared_on = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='Pending')

    student = db.relationship('StudentProfile', back_populates='fee_clearance')

    serialize_rules = ('id', 'student_id', 'cleared_on', 'status')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
        'id': self.id,
        'course': self.course.name if self.course else None,
        'hostel': self.hostel.name if self.hostel else None,
        'semester': self.semester.name if self.semester else None,
        'amount': self.amount
    }
class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)

    # Foreign key for lecturer_id (the person who assigned the task)
    lecturer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    lecturer = db.relationship('User', back_populates='assignments', foreign_keys=[lecturer_id])

    # Foreign key for submitted_by_id (the person who submitted the task)
    submitted_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    submitted_by = db.relationship('User', back_populates='submitted_assignments', foreign_keys=[submitted_by_id])

    serialize_rules = ('id', 'title', 'description', 'due_date', 'lecturer_id')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'lecturer_id': self.lecturer_id,
        }

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100))
    student_email = db.Column(db.String(120))
    student_id = db.Column(db.String(20))
    program_name = db.Column(db.String(100))
    department = db.Column(db.String(100))
    batch_year = db.Column(db.String(10))
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    rejection_reason = db.Column(db.Text, nullable=True)

    rejection_reason=db.Column(db.Text)


    serialize_rules = ('id', 'student_name', 'student_email', 'student_id', 'program_name', 'department', 'batch_year', 'submitted_at', 'status', 'rejection_reason')

    def to_dict(self, rules=()):
        rules = rules or self.serialize_rules
        return {
            'id': self.id,
            'student_name': self.student_name,
            'student_email': self.student_email,
            'student_id': self.student_id,
            'program_name': self.program_name,
            'department': self.department,
            'batch_year': self.batch_year,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'status': self.status,
            'rejection_reason': self.rejection_reason
        }   