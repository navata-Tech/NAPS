from datetime import datetime, timedelta
from functools import wraps
import os
from sqlalchemy.sql import text  # Correct SQLAlchemy import for text()
# Remove or avoid importing `from pydoc import text` if not necessary
from flask import Flask, jsonify, request
from flask_cors import CORS
from flasgger import Swagger
from flask_marshmallow import Marshmallow
from flask_restx import Api, Resource, fields
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies,verify_jwt_in_request
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from models import db,Registration


# Initialize Flask app
app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='NAPS API', description='API for managing NAPS')
swagger = Swagger(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/naps'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads/'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Initialize extensions
db.init_app(app)
ma = Marshmallow(app)


# JWT configuration with expiration
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this to a strong key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize SQLAlchemy with the app
# db.init_app(app)
jwt = JWTManager(app)

# Configure logging
logging.basicConfig(level=logging.ERROR, 
                    format='%(asctime)s %(levelname)s:%(message)s',
                    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()])

# Middleware (decorator) to enforce authorization
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()  # This will raise an error if no JWT is present or invalid
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Unauthorized access', 'error': str(e)}), 401
    return wrapper


@app.route('/')
def hello_world():
    return 'Hello Nepal'

def create_tables():
    try:
        # Using SQLAlchemy's engine to execute raw SQL
        with db.engine.connect() as connection:
            connection.execute(text("""CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )"""))
            connection.execute(text("""CREATE TABLE IF NOT EXISTS registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                registration_number VARCHAR(100) UNIQUE,  -- Ensure this line is present
                category VARCHAR(100),
                salutation VARCHAR(50),
                designation VARCHAR(100),
                organization VARCHAR(150),
                press_conference VARCHAR(100),
                registration_type VARCHAR(100),
                full_name VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(20),
                affiliation VARCHAR(100),
                speciality VARCHAR(100),
                paper_category VARCHAR(100),
                session VARCHAR(100),
                paper_title VARCHAR(255),
                abstract TEXT,
                spouse BOOLEAN DEFAULT FALSE,
                acc_designation JSON,
                country VARCHAR(100),
                file_name VARCHAR(255),
                agree BOOLEAN DEFAULT FALSE,
                payment_method VARCHAR(50),
                foreign_country VARCHAR(100),
                foreign_bank_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

        
        print("Tables created successfully.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
# Create an instance of Api and define namespaces
admin_ns = api.namespace('admin', description='Admin Operations')

admin_model = api.model('Admin', {
    'username': fields.String(required=True, description='Admin username'),
    'email': fields.String(required=True, description='Admin email'),
    'password': fields.String(required=True, description='Admin password')
})

# Handle CORS Preflight Requests
@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        # Handle the preflight request
        response = jsonify({'message': 'CORS preflight successful'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "DELETE, POST, GET, PUT, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        response.status_code = 200
        return response

# Middleware (decorator) to enforce authorization
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()  # This will raise an error if no JWT is present or invalid
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Unauthorized access', 'error': str(e)}), 401
    return wrapper

@app.route('/create-admin', methods=['POST'])
def create_admin():
    data = request.json
    try:
        # Check if the admin already exists using SQLAlchemy
        existing_admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
        if existing_admin:
            return {'message': 'Admin with this email already exists'}, 400

        hashed_password = generate_password_hash(data['password'])
        # Insert new admin using SQLAlchemy
        db.session.execute(
            text("""INSERT INTO admins (username, email, password) VALUES (:username, :email, :password)"""),
            {'username': data['username'], 'email': data['email'], 'password': hashed_password}
        )
        db.session.commit()  # Commit the transaction
        return {'message': 'Admin created successfully'}, 201
    except Exception as e:
        db.session.rollback()  # Roll back the session in case of error
        logging.error(f'Error creating admin: {e}')
        return {'message': f'Error: {e}'}, 500
        
@app.route('/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        # CORS preflight handling
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5174")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200
    
    data = request.json
    try:
        admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
        if admin and check_password_hash(admin[3], data['password']):
            access_token = create_access_token(identity=admin[0])
            return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
        return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        logging.error(f'Error during admin login: {e}')
        # Ensure the error response is JSON
        return jsonify({'message': 'Internal server error'}), 500



@admin_ns.route('/logout')
class AdminLogout(Resource):
    @admin_required  # Protect this route
    def post(self):
        """
        Log out the admin by clearing the JWT token.
        """
        response = jsonify({'message': 'Logged out successfully'})
        unset_jwt_cookies(response)  # Clear the JWT cookie
        return response, 200

# Protected route example for admin
@admin_ns.route('/protected')
class ProtectedAdmin(Resource):
    @api.doc(security='bearerAuth')
    @jwt_required()  # Protect this route with JWT
    def get(self):
        current_admin_id = get_jwt_identity()  # Get the ID of the logged-in admin
        return {'message': f'Welcome admin {current_admin_id}!'}
    
# Define Registration API with CRUD Operations
registration_ns = api.namespace('registrations', description='Manage Registrations')

@app.route('/register', methods=['POST'])
def create_registration():
    data = request.json
    try:
        # Generate a unique registration number based on creation time
        registration_number = f"REG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        new_registration = Registration(
            registration_number=registration_number,
            category=data.get('category'),
            salutation=data.get('salutation'),
            designation=data.get('designation'),
            organization=data.get('organization'),
            press_conference=data.get('pressConference'),
            registration_type=data.get('registrationType'),
            full_name=data.get('fullName'),
            email=data.get('email'),
            phone=data.get('phone'),
            affiliation=data.get('affiliation'),
            speciality=data.get('speciality'),
            paper_category=data.get('paperCategory'),
            session=data.get('session'),
            paper_title=data.get('paperTitle'),
            abstract=data.get('abstract'),
            spouse=data.get('spouse', False),
            acc_designation=data.get('accDesignation', []),
            country=data.get('country'),
            file_name=data.get('file'),
            agree=data.get('agree', False),
            payment_method=data.get('paymentMethod'),
            foreign_country=data.get('foreignCountry'),
            foreign_bank_details=data.get('foreignBankDetails')
        )
        db.session.add(new_registration)
        db.session.commit()
        return jsonify({'message': 'Registration created successfully!', 'registration_number': registration_number, 'id': new_registration.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating registration', 'error': str(e)}), 500

# DELETE method to delete a registration
@app.route('/register/<int:id>', methods=['DELETE'])
def delete_registration(id):
    registration = Registration.query.get(id)
    if not registration:
        return jsonify({'message': 'Registration not found'}), 404
    db.session.delete(registration)
    db.session.commit()
    return jsonify({'message': 'Registration deleted successfully'}), 200

# PUT method to update a registration
@app.route('/register/<int:id>', methods=['PUT'])
def update_registration(id):
    data = request.json
    registration = Registration.query.get(id)
    if not registration:
        return jsonify({'message': 'Registration not found'}), 404
    try:
        for key, value in data.items():
            if hasattr(registration, key):
                setattr(registration, key, value)
        db.session.commit()
        return jsonify({'message': 'Registration updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating registration', 'error': str(e)}), 500

# GET method to fetch all registrations
@app.route('/register', methods=['GET'])
def get_registrations():
    try:
        registrations = Registration.query.all()
        return jsonify([r.__dict__ for r in registrations if '_sa_instance_state' not in r.__dict__]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching registrations', 'error': str(e)}), 500

# GET method to fetch a single registration by ID
@app.route('/register/<int:id>', methods=['GET'])
def get_registration_by_id(id):
    registration = Registration.query.get(id)
    if not registration:
        return jsonify({'message': 'Registration not found'}), 404
    return jsonify({key: value for key, value in registration.__dict__.items() if key != '_sa_instance_state'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This will create tables for all models defined in the app (including Registration)
    app.run(debug=True)

