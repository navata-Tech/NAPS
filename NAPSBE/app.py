from datetime import datetime, timedelta, timezone
from functools import wraps
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
import os
from click import wrap_text
from sqlalchemy.sql import text  # Correct SQLAlchemy import for text()
# Remove or avoid importing `from pydoc import text` if not necessary
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flasgger import Swagger
from flask_marshmallow import Marshmallow
from flask_restx import Api, Resource, fields
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies,verify_jwt_in_request
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from models import db,Registration
from werkzeug.utils import secure_filename
from uuid import uuid4
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics




# Initialize Flask app
app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='NAPS API', description='API for managing NAPS')
swagger = Swagger(app)

app.config['UPLOAD_FOLDER'] = 'uploads/'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/naps'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False



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
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS registrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    registration_number VARCHAR(100) UNIQUE,
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
                    registration_fee INT DEFAULT 5000,
                    total_amount INT,
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
    
@app.route('/register', methods=['POST'])
def create_registration():
    try:
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
        else:
            filename = None

        # Handle form data
        data = request.form.to_dict(flat=True)

        # Debugging logs for incoming data
        logging.info(f"Received form data: {data}")

        # Safely extract registration fee and total amount
        try:
            registration_fee = float(data.get('registrationFee', 0))
        except ValueError:
            registration_fee = 0

        try:
            total_amount = float(data.get('totalAmount', 0))
        except ValueError:
            total_amount = 0
        # Debugging logs for extracted numeric values
        logging.info(f"Parsed values - Registration Fee: {registration_fee}, Total Amount: {total_amount}")


        # Other fields
        registration_number = f"REG-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:8]}"
        spouse = data.get('spouse', False) == 'true'
        acc_designation = request.form.getlist('accDesignation[]')

        # Create a new registration instance
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
            spouse=spouse,
            acc_designation=acc_designation,
            country=data.get('country'),
            file_name=filename,
            agree=data.get('agree', False) == 'true',
            payment_method=data.get('paymentMethod'),
            foreign_country=data.get('foreignCountry'),
            foreign_bank_details=data.get('foreignBankDetails'),
            registration_fee=registration_fee,
            total_amount=total_amount
        )

        # Save the new registration in the database
        db.session.add(new_registration)
        db.session.commit()

        return jsonify({
            'message': 'Registration created successfully!',
            'registration_number': registration_number,
            'id': new_registration.id
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating registration: {e}")
        return jsonify({'message': 'Error creating registration', 'error': str(e)}), 500


# GET method to fetch a single registration by ID
@app.route('/register/<int:id>', methods=['GET'])
def get_registration_by_id(id):
    registration = Registration.query.get(id)
    if not registration:
        return jsonify({'message': 'Registration not found'}), 404
    return jsonify({key: value for key, value in registration.__dict__.items() if key != '_sa_instance_state'}), 200

@app.route('/api/registrations', methods=['GET'])
def get_all_registrations():
    try:
        registrations = Registration.query.all()
        registrations_data = []
        for reg in registrations:
            registrations_data.append({
                'registration_number': reg.registration_number,
                'full_name': reg.full_name,
                'email': reg.email,
                'phone': reg.phone,
                'category': reg.category,
            })
        return jsonify(registrations_data), 200
    except Exception as e:
        app.logger.error(f"Error fetching registrations: {str(e)}")
        return jsonify({'error': 'Error fetching registrations', 'message': str(e)}), 500
def wrap_text(text, width, font_name, font_size):
    """
    Wrap text for the given width and font size.
    """
    lines = []
    words = text.split(' ')
    line = ''
    for word in words:
        test_line = f'{line} {word}'.strip()
        # Use stringWidth from pdfmetrics
        if pdfmetrics.stringWidth(test_line, font_name, font_size) <= width:
            line = test_line
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines

@app.route('/api/registrations-pdf/<registration_number>', methods=['GET'])
def generate_registration_pdf_by_form(registration_number):
    try:
        if not registration_number:
            return jsonify({'error': 'Missing registration number'}), 400

        # Retrieve registration details from the database
        registration = Registration.query.filter_by(registration_number=registration_number).first()

        if not registration:
            app.logger.error(f'Registration not found for number: {registration_number}')
            return jsonify({'error': 'Registration not found'}), 404

        # Create PDF using the registration data
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)

        # Header Section
        pdf.drawImage("./assest/logo.png", 40, 725, width=50, height=50)  # Logo
        pdf.setFont("Helvetica-Bold", 16)
        pdf.setFillColorRGB(251/255, 175/255, 22/255)  # Color for the text
        pdf.drawString(100, 760, "Nepalese Association of Pediatric Surgeons")
        pdf.setFont("Helvetica", 10)
        pdf.setFillColorRGB(0, 0, 0)  # Black for contact details
        pdf.drawString(100, 745, "Mail: pedsurg.nepal@gmail.com")
        pdf.drawString(100, 730, "Phone: 01-4411550")

        # Horizontal line above Registration Details
        pdf.setFillColorRGB(160/255, 31/255, 98/255)  # Background color for the line
        pdf.rect(50, 715, 500, 2, stroke=0, fill=1)  # Rectangle as a horizontal line

        # Registration Details Header
        pdf.setFont("Helvetica-Bold", 14)
        pdf.setFillColorRGB(0, 0, 0)  # Reset to black for text
        pdf.drawString(50, 700, "Registration Details")
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, 685, f"Generated On: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Registration Number
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, 675, f"Registration Number: {registration.registration_number}")
        pdf.setFont("Helvetica", 10)
        y = 655

        # Registration Fields
        registration_fields = [
            ("Category", registration.category),
            ("Salutation", registration.salutation),
            ("Designation", registration.designation),
            ("Organization", registration.organization),
            ("Press Conference", registration.press_conference),
            ("Registration Type", registration.registration_type),
            ("Full Name", registration.full_name),
            ("Email", registration.email),
            ("Phone", registration.phone),
            ("Affiliation", registration.affiliation),
            ("Speciality", registration.speciality),
            ("Paper Category", registration.paper_category),
            ("Session", registration.session),
            ("Paper Title", registration.paper_title),
            ("Abstract", registration.abstract),
            ("Spouse", "Yes" if registration.spouse else "No"),
            ("Country", registration.country),
            ("Agreement", "Agreed" if registration.agree else "Not Agreed"),
        ]

        # Iterate and display fields in the PDF with labels and boxes
        for field_name, field_value in registration_fields:
            if not field_value:  # Skip empty fields
                continue
            
            # Draw label in black color, with a consistent x-coordinate
            label_x = 50
            box_x = 150  # Align the boxes right after the labels
            pdf.setFont("Helvetica-Bold", 12)
            pdf.setFillColorRGB(0, 0, 0)  # Black for labels
            pdf.drawString(label_x, y, f"{field_name}:")
            y -= 15

            # Draw the box with the border color #a01f62 and align with label
            pdf.setFillColorRGB(1, 1, 1)  # Fill color inside box (white)
            pdf.setStrokeColorRGB(160/255, 31/255, 98/255)  # Box border color #a01f62
            pdf.rect(box_x, y, 350, 15, fill=1, stroke=1)  # Box for value

            # Draw value inside the box
            pdf.setFillColorRGB(0, 0, 0)  # Text color inside the box (black)
            pdf.setFont("Helvetica", 10)
            text_lines = wrap_text(str(field_value), 340, "Helvetica", 10)
            for line in text_lines:
                pdf.drawString(box_x + 5, y + 2, line)
                y -= 15

            # Adjust the space between fields for better line spacing
            if y < 50:  # Avoid writing below footer
                pdf.showPage()
                pdf.setFont("Helvetica", 10)
                y = 750

        # Spouse Details Section (if any)
        if registration.spouse:
            pdf.setFont("Helvetica-Bold", 12)
            pdf.setFillColorRGB(0, 0, 0)  # Black for label
            pdf.drawString(50, y, "Accompanying Spouse/Person Details:")
            y -= 20

            # # For each spouse designation, display the details inside boxes
            # spouse_fee = 8000  # Default fee for spouse in NPR
            # spouse_currency = "NPR"
            for designation in registration.acc_designation:
                pdf.setFont("Helvetica", 10)
                pdf.setFillColorRGB(0, 0, 0)  # Black for label
                pdf.drawString(50, y, f"Full Name: {designation}")
                y -= 15

                # Draw the box for spouse's designation
                pdf.setFillColorRGB(1, 1, 1)  # White box
                pdf.setStrokeColorRGB(160/255, 31/255, 98/255)  # Box border color #a01f62
                pdf.rect(150, y, 350, 15, fill=1, stroke=1)  # Box for value
                pdf.setFillColorRGB(0, 0, 0)  # Text inside the box (black)
                pdf.setFont("Helvetica", 10)
                pdf.drawString(155, y + 2, registration.designation)
                y -= 15

                # # Box for spouse fee
                # pdf.setFillColorRGB(1, 1, 1)  # White box
                # pdf.setStrokeColorRGB(160/255, 31/255, 98/255)  # Box border color #a01f62
                # pdf.rect(150, y, 350, 15, fill=1, stroke=1)  # Box for fee
                # pdf.setFillColorRGB(0, 0, 0)  # Text inside the box (black)
                # # pdf.drawString(155, y + 2, f"{spouse_currency} {spouse_fee}")
                # y -= 15
                # if y < 50:
                #     pdf.showPage()
                #     pdf.setFont("Helvetica", 10)
                #     y = 750

        # Registration Fee and Total Amount (after Spouse Details)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.setFillColorRGB(0, 0, 0)  # Black for label
        pdf.drawString(50, y, f"Registration Fee:")
        y -= 15
        pdf.setFillColorRGB(1, 1, 1)  # White box
        pdf.setStrokeColorRGB(160/255, 31/255, 98/255)  # Box border color #a01f62
        pdf.rect(150, y, 350, 15, fill=1, stroke=1)  # Box for fee
        pdf.setFillColorRGB(0, 0, 0)  # Text inside the box (black)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(155, y + 2, f"{registration.registration_fee}")
        y -= 20
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, f"Total Amount:")
        y -= 15
        pdf.setFillColorRGB(1, 1, 1)  # White box
        pdf.setStrokeColorRGB(160/255, 31/255, 98/255)  # Box border color #a01f62
        pdf.rect(150, y, 350, 15, fill=1, stroke=1)  # Box for total amount
        pdf.setFillColorRGB(0, 0, 0)  # Text inside the box (black)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(155, y + 2, f"{registration.total_amount}")
        y -= 20

        # Footer
        pdf.setFont("Helvetica-Oblique", 8)
        pdf.drawString(50, 30, "Generated by NAPS System")

        # Save the PDF to buffer
        pdf.showPage()
        pdf.save()

        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"{registration_number}_registration.pdf")

    except Exception as e:
        app.logger.error(f"Error generating PDF for registration {registration_number}: {str(e)}")
        return jsonify({'error': 'Error generating PDF', 'message': str(e)}), 500



if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This will create tables for all models defined in the app (including Registration)
    app.run(debug=True)

