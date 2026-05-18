from project.db import DATABASE
from flask_login import UserMixin


class User(DATABASE.Model, UserMixin):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    email = DATABASE.Column(DATABASE.String(50), nullable=False, unique=True)
    password = DATABASE.Column(DATABASE.String(30), nullable=False)
    name = DATABASE.Column(DATABASE.String(50), nullable=True)
    second_name = DATABASE.Column(DATABASE.String(50), nullable=True)
    user_name = DATABASE.Column(DATABASE.String(50), nullable=True, unique=True)
    date_of_birth = DATABASE.Column(DATABASE.String(8), nullable=True)
    gender = DATABASE.Column(DATABASE.String(10), nullable=True)


