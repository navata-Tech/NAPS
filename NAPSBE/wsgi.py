from app import app, create_tables
from models import db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This will create tables for all models defined in the app (including Registration)
    app.run(debug=True)
