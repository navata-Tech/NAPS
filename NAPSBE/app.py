from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from functools import wraps
import openpyxl
from flask import send_from_directory
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
import os
from click import wrap_text
from flask_mail import Mail, Message
from sqlalchemy.sql import text  # Correct SQLAlchemy import for text()
# Remove or avoid importing `from pydoc import text` if not necessary
from flask import Flask, jsonify, request,send_file
from flask import make_response
from flask import Response
from flask_cors import CORS
from flasgger import Swagger
from flask_marshmallow import Marshmallow
from flask_restx import Api, Resource, fields
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies,verify_jwt_in_request
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from models import Enquiry, db,Registration
from werkzeug.utils import secure_filename
from uuid import uuid4
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics





# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
api = Api(app, version='1.0', title='NAPS API', description='API for managing NAPS')
swagger = Swagger(app)

app.config['UPLOAD_FOLDER'] = 'uploads/'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/naps'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://napsorg_admin:%40Naps%40321%40@localhost/napsorg_naps'
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
    



# Configuring the mail settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'Pedsurg.nepal@gmail.com'  # Your email address
app.config['MAIL_PASSWORD'] = 'whoh ktsl uchc ldnh'  # Your email password (or app-specific password)
app.config['MAIL_DEFAULT_SENDER'] = 'Pedsurg.nepal@gmail.com'

mail = Mail(app)


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
            connection.execute(text("""CREATE TABLE IF NOT EXISTS enquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                phone VARCHAR(20),
                email VARCHAR(100),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )"""))

        
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




@app.route('/create-admin', methods=['POST'])
def create_admin():
    default_admin = {
        'username': 'admin',
        'email': 'Pedsurg.nepal@gmail.com',
        'password': '@Naps@321'
    }

    try:
        existing_admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': default_admin['email']}).fetchone()
        if existing_admin:
            return {'message': 'Admin with this email already exists'}, 400

        hashed_password = generate_password_hash(default_admin['password'])
        print(f"Hashed Password: {hashed_password}")  # Debugging output
        
        db.session.execute(
            text("""INSERT INTO admins (username, email, password) VALUES (:username, :email, :password)"""),
            {'username': default_admin['username'], 'email': default_admin['email'], 'password': hashed_password}
        )
        db.session.commit()  # Commit the transaction
        return {'message': 'Admin created successfully'}, 201
    except Exception as e:
        db.session.rollback()
        logging.error(f'Error creating admin: {e}')
        return {'message': f'Error: {e}'}, 500

        
@app.route('/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200
    
    data = request.json
    try:
        admin = db.session.execute(text("SELECT * FROM admins WHERE email = :email"), {'email': data['email']}).fetchone()
        if admin and check_password_hash(admin[3], data['password']):  # Ensure admin[3] is correct column for password hash
            access_token = create_access_token(identity=admin[0])
            response = jsonify({'message': 'Login successful', 'access_token': access_token})
            response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
            return response, 200
        return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        logging.error(f'Error during admin login: {e}')
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
    
@app.route('/register', methods=['POST', 'OPTIONS'])
def create_registration():
    if request.method == 'OPTIONS':
        return jsonify({'message': 'Preflight check successful'}), 200
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


        # Check if email already exists (case-insensitive)
        existing_registration = Registration.query.filter(
            func.lower(Registration.email) == func.lower(data.get('email'))
        ).first()
        
        if existing_registration:
            logging.info(f"Existing registration found for email: {data.get('email')}")
            return jsonify({'message': 'Error', 'error': 'Email already exists'}), 400
        


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
        db.session.flush()  # Ensure the record is visible immediately



        # Send confirmation email to the user
        user_email = new_registration.email
        user_message = Message(
            'Registration Confirmation',
            recipients=[user_email]
        )
        user_message.body = f"""
        Thank you for your registration!
        
        Your registration number is: {registration_number}
        You will receive a confirmation email after verification.
        """
        mail.send(user_message)

        # Send notification email to the admin
        admin_email = 'udityadav2221@gmail.com'
        admin_message = Message(
            'New Registration Submitted',
            recipients=[admin_email]
        )
        admin_message.body = f"""
        A new registration has been submitted:
        
        Registration Number: {registration_number}
        Name: {new_registration.full_name}
        Email: {new_registration.email}
        Phone: {new_registration.phone}
        Category: {new_registration.category}
        """
        mail.send(admin_message)

        return jsonify({
            'message': 'Registration created successfully!',
            'registration_number': registration_number,
            'id': new_registration.id
        }), 201
    except Exception as e:
        app.logger.error(f"Error registering user: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
        

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve files from the 'uploads' folder
    """
    try:
        # Send the requested file from the UPLOAD_FOLDER
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        # If an error occurs (e.g., file not found), return an error message
        return jsonify({'message': 'File not found', 'error': str(e)}), 404

@app.route('/api/registration-files', methods=['GET'])
def list_all_registration_files():
    try:
        # Query all registrations that have uploaded files
        registrations = Registration.query.filter(Registration.file_name.isnot(None)).all()

        # If no registrations with files exist
        if not registrations:
            return jsonify({'message': 'No files uploaded yet'}), 404

        # Prepare the list of registration details with files
        files_data = []
        for registration in registrations:
            files_data.append({
                'registration_number': registration.registration_number,
                'name': registration.full_name,
                'total_amount': registration.total_amount,
                'file_name': registration.file_name,
                'file_url': f'/uploads/{registration.file_name}'
            })

        return jsonify(files_data)

    except Exception as e:
        logging.error(f"Error listing uploaded files: {e}")
        return jsonify({'message': 'Error fetching file list', 'error': str(e)}), 500

@app.route('/api/registration-file/<registration_number>', methods=['GET'])
def get_registration_file(registration_number):
    try:
        # Query the registration based on the provided registration number
        registration = Registration.query.filter_by(registration_number=registration_number).first()

        if not registration:
            return jsonify({'message': 'Registration not found'}), 404

        # Check if the file exists
        if not registration.file_name:
            return jsonify({'message': 'No file uploaded for this registration'}), 404

        # Build the file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], registration.file_name)

        # Check if the file exists in the specified directory
        if not os.path.exists(file_path):
            return jsonify({'message': 'File not found on server'}), 404

        # Return the file along with additional registration details
        return jsonify({
            'registration_number': registration.registration_number,
            'name': registration.full_name,
            'total_amount': registration.total_amount,
            'file_name': registration.file_name,
            'file_url': f'/uploads/{registration.file_name}'  # Assuming you're serving the file from '/uploads' folder
        })

    except Exception as e:
        logging.error(f"Error fetching file for registration {registration_number}: {e}")
        return jsonify({'message': 'Error fetching file', 'error': str(e)}), 500


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

@app.route('/api/registrations-excel', methods=['GET'])
def export_registrations_to_excel():
    try:
        # Fetch all registrations from the database
        registrations = Registration.query.all()

        # Create a new Excel workbook and sheet
        wb = openpyxl.Workbook()
        sheet = wb.active
        sheet.title = "Registrations"

        # Define the header row
        header = [
            'Registration Number', 'Full Name', 'Email', 'Phone', 'Category',
            'Salutation', 'Designation', 'Organization', 'Press Conference', 'Registration Type',
            'Speciality', 'Paper Category', 'Session', 'Paper Title', 'Abstract',
            'Spouse', 'Country', 'File Name', 'Registration Fee', 'Total Amount', 'Acc Designation'
        ]
        sheet.append(header)

        # Append each registration's data to the sheet
        for reg in registrations:
            # Ensure 'spouse' field is boolean and converts to 'Yes'/'No'
            spouse = 'Yes' if reg.spouse else 'No'

            row = [
                reg.registration_number, reg.full_name, reg.email, reg.phone, reg.category,
                reg.salutation, reg.designation, reg.organization, reg.press_conference,
                reg.registration_type, reg.speciality, reg.paper_category, reg.session,
                reg.paper_title, reg.abstract, spouse, reg.country, reg.file_name,
                reg.registration_fee, reg.total_amount, ', '.join(reg.acc_designation) if reg.acc_designation else ''
            ]
            sheet.append(row)

        # Save the workbook in memory as a binary stream
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Wrap in a Response object to make Flask handle it like a file
        response = Response(output.getvalue(), mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response.headers['Content-Disposition'] = 'attachment; filename=registrations.xlsx'

        return response

    except Exception as e:
        app.logger.error(f"Error exporting registrations to Excel: {str(e)}")
        return jsonify({'error': 'Error exporting registrations', 'message': str(e)}), 500
    
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

        registration = Registration.query.filter_by(registration_number=registration_number).first()

        if not registration:
            app.logger.error(f'Registration not found for number: {registration_number}')
            return jsonify({'error': 'Registration not found'}), 404

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)

        # Function to check and add new page
        def check_page_full(y_position):
            if y_position < 50:  # Avoid writing below footer
                pdf.showPage()
                # Draw header again on new page
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
                # Set y_position to a new starting value
                y_position = 700
            return y_position

        # Header Section (Same as before)
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

        # Set x-coordinates for consistent alignment
        label_x = 50
        value_x = 150  # Slightly shifted from the label for the value
        max_line_width = 350  # Maximum width for the text value (to ensure wrapping)

        # Iterate and display fields in the PDF with labels and values
        for field_name, field_value in registration_fields:
            if not field_value:  # Skip empty fields
                continue
            
            # Draw label in black color, with a consistent x-coordinate
            pdf.setFont("Helvetica-Bold", 12)
            pdf.setFillColorRGB(0, 0, 0)  # Black for labels
            pdf.drawString(label_x, y, f"{field_name}:")
            y -= 15  # Move down for the value

            # Now just draw the value below the label, aligned with label
            pdf.setFont("Helvetica", 10)
            text_lines = wrap_text(str(field_value), max_line_width, "Helvetica", 10)
            for line in text_lines:
                pdf.drawString(value_x, y, line)  # Align text with the label
                y -= 15  # Move down after drawing each line of the text

            # Check if the page is full and start a new page if necessary
            y = check_page_full(y)
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

        # Get the buffer contents
        buffer.seek(0)
        pdf_data = buffer.read()

        # Return the file as a response
        return Response(pdf_data, content_type="application/pdf", 
                        headers={"Content-Disposition": f"attachment; filename={registration_number}_registration.pdf"})

    except Exception as e:
        app.logger.error(f"Error generating PDF for registration {registration_number}: {str(e)}")
        return jsonify({'error': 'Error generating PDF', 'message': str(e)}), 500
    

@app.route('/enquiry', methods=['POST'])
def submit_enquiry():
    try:
        data = request.get_json()  # Receive the JSON data from the frontend
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email')
        message = data.get('message')

        # Create a new enquiry record
        new_enquiry = Enquiry(
            name=name,
            phone=phone,
            email=email,
            message=message
        )

        # Save the new enquiry in the database
        db.session.add(new_enquiry)
        db.session.commit()

        response = jsonify({'message': 'Thank you for your enquiry. We will notify you via email soon!'})
        response.headers.add("Access-Control-Allow-Origin", "https://naps.org.np")
        return response, 201

    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")  # Log the error for debugging
        response = jsonify({'message': 'There was an error submitting your enquiry. Please try again later.'})
        response.headers.add("Access-Control-Allow-Origin", "https://naps.org.np")
        return response, 500


@app.route('/enquiry', methods=['GET'])
def get_enquiries():
    try:
        # Fetch all the enquiry records from the database
        enquiries = Enquiry.query.all()

        # Log the number of enquiries fetched
        print(f"Fetched {len(enquiries)} enquiries.")

        # Prepare the list of enquiries to return
        enquiry_list = [
            {
                'id': enquiry.id,
                'name': enquiry.name,
                'phone': enquiry.phone,
                'email': enquiry.email,
                'message': enquiry.message,
                'date': enquiry.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Use created_at here
            }
            for enquiry in enquiries
        ]

        return jsonify(enquiry_list), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'There was an error retrieving the enquiries. Please try again later.'}), 500
    
@app.route('/enquiry/<int:id>', methods=['GET'])
def get_enquiry(id):
    try:
        # Fetch the enquiry record by id from the database
        enquiry = Enquiry.query.get(id)

        if enquiry is None:
            return jsonify({'message': 'Enquiry not found'}), 404

        # Prepare the enquiry details to return
        enquiry_details = {
            'id': enquiry.id,
            'name': enquiry.name,
            'phone': enquiry.phone,
            'email': enquiry.email,
            'message': enquiry.message,
            'date': enquiry.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

        return jsonify(enquiry_details), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'There was an error retrieving the enquiry details. Please try again later.'}), 500
        
def create_tables():
    try:
        with app.app_context():
            db.create_all()  # This will create tables for all models defined in the app
            print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")

if __name__ == '__main__':
    create_tables()  # Ensure this function is called before app.run()
    app.run(debug=True)

