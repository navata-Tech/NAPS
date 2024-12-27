
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
# Initialize the db object
db = SQLAlchemy()

# Define the Registration model
class Registration(db.Model):
    __tablename__ = 'registrations'

    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(100), unique=True)  # Add registration_number field
    category = db.Column(db.String(100))
    salutation = db.Column(db.String(50))
    designation = db.Column(db.String(100))
    organization = db.Column(db.String(150))
    press_conference = db.Column(db.String(100))
    registration_type = db.Column(db.String(100))
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    affiliation = db.Column(db.String(100))
    speciality = db.Column(db.String(100))
    paper_category = db.Column(db.String(100))
    session = db.Column(db.String(100))
    paper_title = db.Column(db.String(255))
    abstract = db.Column(db.Text)
    spouse = db.Column(db.Boolean, default=False)
    acc_designation = db.Column(db.JSON)
    country = db.Column(db.String(100))
    file_name = db.Column(db.String(255))
    agree = db.Column(db.Boolean, default=False)
    payment_method = db.Column(db.String(50))
    foreign_country = db.Column(db.String(100))
    foreign_bank_details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)