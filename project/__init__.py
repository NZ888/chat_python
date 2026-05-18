from .app import project
import user 
from .urls import *

project.register_blueprint(blueprint=user.user)