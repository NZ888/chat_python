import flask_migrate, flask_sqlalchemy, os
from .app import project

project.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"

DATABASE = flask_sqlalchemy.SQLAlchemy(project)
MIGRATE = flask_migrate.Migrate(
    app = project,
    db = DATABASE,
    directory = os.path.abspath(os.path.join(__file__, "..", "migrations"))
)