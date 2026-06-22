import flask_login
from project.app import project
import dotenv, os
from user.models import User

dotenv.load_dotenv()
secret_key = os.getenv("SECRET_KEY") or os.getenv("SECRET")

if not secret_key:
    raise RuntimeError("SECRET_KEY is not set in .env")

project.config["SECRET_KEY"] = secret_key

login_manager = flask_login.LoginManager(app=project)

@login_manager.user_loader
def get_user(user_id):
    return User.query.get(user_id)
