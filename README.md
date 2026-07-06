# Flask Chat Project

## English

### 1. Project Purpose

This project was created as a small practice web app for learning Flask. The main idea is to build a simple chat application with user registration, login, a database, templates, static files, and real-time messages.

This project is useful because it shows how different parts of a web app work together: routes, models, forms, authentication, migrations, and frontend files. It is not a very big project, so it is easier to read and understand step by step.

### 2. README Navigation

- Project purpose
- README navigation
- Modules and technologies
- How to run the project
- Project structure and apps
- Conclusion

### 3. Modules and Technologies

The project uses these main technologies and modules:

- Python
- Flask for the web application
- Flask-Login for user sessions and login state
- Flask-SocketIO for real-time chat messages
- Jinja2 templates for HTML pages
- SQLite as a local database
- SQLAlchemy models for database tables
- Flask-Migrate / Alembic for database migrations
- python-dotenv for reading local `.env` settings
- HTML, CSS, and JavaScript for the frontend part

### 4. How to Run the Project

Open the project folder:

```powershell
cd chat
```

If you are already in this folder, you can skip this command.

Create and activate a virtual environment:

```powershell
python -m venv venv
venv\Scripts\activate
```

Install dependencies from the project:

```powershell
pip install -r requirements.txt
```

The code also imports database and environment packages. If they are not installed yet, install them too:

```powershell
pip install Flask-SQLAlchemy Flask-Migrate python-dotenv
```

Create a `.env` file in the project folder. A simple local example can look like this:

```env
SECRET_KEY=dev-secret-key
EMAIL=your_email@gmail.com
SMT_PASSWORD=your_email_app_password
DB_INIT=flask --app project:project db init -d project/migrations
DB_MIGRATE=flask --app project:project db migrate -d project/migrations -m auto
DB_UPGRADE=flask --app project:project db upgrade -d project/migrations
```

For a normal local start, run:

```powershell
python manage.py
```

After that, the project should open on:

```text
http://localhost:8000
```

If email sending is not configured, registration with email confirmation can fail. This is because the project sends a real Gmail SMTP message during registration.

### 5. Project Structure and Apps

Main parts of the project:

- `manage.py` starts the Flask development server on port `8000`.
- `project/` contains the main Flask app setup, database setup, login setup, SocketIO setup, URL registration, shared templates, static files, and migrations.
- `user/` contains registration, login, email confirmation, user model, auth templates, CSS, and user images.
- `chat/` contains the chat blueprint, chat routes, SocketIO events, chat models, chat template, CSS, JavaScript, and chat images.
- `project/migrations/` stores Alembic migration files for database changes.
- `project/instance/` is used for local runtime data, for example the SQLite database file.

![alt text](../screenshots/image.png)

### 6. Conclusion

This project was useful for practicing how a Flask app is built from several smaller parts. During the work on it, a beginner can learn how to connect pages, user accounts, database models, migrations, and real-time chat logic.

In the future, the project could be improved by adding better form validation, clearer error messages, profile editing, and more careful handling of email settings.
---

## Українська

### 1. Мета створення проєкту

Цей проєкт був створений як невеликий навчальний вебдодаток для практики з Flask. Основна ідея проєкту - зробити простий чат з реєстрацією користувачів, входом в акаунт, базою даних, шаблонами, статичними файлами та повідомленнями в реальному часі.

цей проєкт корисний тим, що показує, як різні частини вебдодатку працюють разом: маршрути, моделі, форми, авторизація, міграції та frontend-файли. Проєкт не дуже великий, тому його можна розібрати поступово.

### 2. Зміст файлу README

- Мета створення проєкту
- Зміст файлу README
- Перелік модулів та технологій
- Як запустити проєкт в роботу
- Зміст проєкту
- Висновок по роботі

### 3. Перелік модулів та технологій

У проєкті використовуються такі основні технології та модулі:

- Python
- Flask для вебдодатку
- Flask-Login для авторизації та сесій користувача
- Flask-SocketIO для роботи чату в реальному часі
- Jinja2 templates для HTML-сторінок
- SQLite як локальна база даних
- SQLAlchemy models для таблиць бази даних
- Flask-Migrate / Alembic для міграцій бази даних
- python-dotenv для читання локальних налаштувань з `.env`
- HTML, CSS та JavaScript для frontend-частини

### 4. Як запустити проєкт в роботу

Відкрийте папку проєкту:

```powershell
cd chat
```

Якщо ви вже у цій папці, цю команду можна пропустити.

Створіть і активуйте віртуальне середовище:

```powershell
python -m venv venv
venv\Scripts\activate
```

Встановіть залежності з проєкту:

```powershell
pip install -r requirements.txt
```

Код також імпортує пакети для бази даних та `.env`. Якщо вони ще не встановлені, додайте їх окремо:

```powershell
pip install Flask-SQLAlchemy Flask-Migrate python-dotenv
```

Створіть файл `.env` у папці проєкту. Простий приклад для локального запуску:

```env
SECRET_KEY=dev-secret-key
EMAIL=your_email@gmail.com
SMT_PASSWORD=your_email_app_password
DB_INIT=flask --app project:project db init -d project/migrations
DB_MIGRATE=flask --app project:project db migrate -d project/migrations -m auto
DB_UPGRADE=flask --app project:project db upgrade -d project/migrations
```

Для звичайного локального запуску виконайте:

```powershell
python manage.py
```

Після цього проєкт має відкриватися за адресою:

```text
http://localhost:8000
```

Якщо відправка email не налаштована, реєстрація з підтвердженням пошти може не спрацювати. Це нормально для локального запуску, бо проєкт намагається відправити справжній лист через Gmail SMTP.

### 5. Зміст проєкту

Основні частини проєкту:

- `manage.py` запускає Flask development server на порту `8000`.
- `project/` містить основне налаштування Flask-додатку, базу даних, login, SocketIO, реєстрацію URL, спільні templates, static-файли та міграції.
- `user/` відповідає за реєстрацію, login, підтвердження email, модель користувача, templates для авторизації, CSS та зображення.
- `chat/` відповідає за чат, маршрути чату, SocketIO events, моделі чату, template, CSS, JavaScript та зображення.
- `project/migrations/` зберігає Alembic migrations для змін у базі даних.
- `project/instance/` використовується для локальних runtime-даних, наприклад SQLite database file.

![alt text](../screenshots/image.png)


### 6. Висновок по роботі

Цей проєкт був корисний для практики побудови Flask-додатку з кількох частин. Під час роботи з ним можна навчитися з'єднувати сторінки, акаунти користувачів, моделі бази даних, міграції та логіку чату в реальному часі.

У майбутньому проєкт можна покращити: додати кращу перевірку форм, зрозуміліші повідомлення про помилки, редагування профілю та акуратнішу роботу з email-налаштуваннями.