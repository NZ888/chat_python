import user


user.user.add_url_rule(
    rule = '/register/',
    view_func = user.render_register,
    methods = ["GET", "POST"]
)