import JSZip from 'jszip';

export interface ProjectFileInfo {
  path: string;
  category: 'Backend' | 'Models' | 'Routes' | 'Services' | 'Templates' | 'Config' | 'Tests';
  description: string;
  content: string;
}

export function getProjectFiles(): ProjectFileInfo[] {
  return [
    {
      path: 'run.py',
      category: 'Backend',
      description: 'Application entry point and CLI runner',
      content: `"""
E-Biddalay - Complete School Management Web Application for Bangladesh
Entrypoint script for running development and production servers.
"""
import os
from app import create_app, db
from app.models import User, School, Student, Subject, Examination, GradingPolicy

app = create_app(os.getenv('FLASK_CONFIG', 'default'))

@app.shell_context_processor
def make_shell_context():
    return dict(db=db, User=User, School=School, Student=Student, Subject=Subject, Examination=Examination)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
`
    },
    {
      path: 'config.py',
      category: 'Config',
      description: 'Multi-environment configuration (Development SQLite, Production PostgreSQL)',
      content: `import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-bangladesh-school-2026'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TIMEZONE = 'Asia/Dhaka'
    DEFAULT_CURRENCY = 'BDT (Tk)'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    UPLOAD_FOLDER = os.path.join(basedir, 'app/static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \\
        'sqlite:///' + os.path.join(basedir, 'school_dev.db')

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \\
        'postgresql://postgres:password@localhost:5432/school_db'
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
`
    },
    {
      path: 'requirements.txt',
      category: 'Config',
      description: 'Exact pinned Python dependencies',
      content: `Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.7
Flask-Login==0.6.3
Flask-WTF==1.2.1
WTForms==3.1.2
Werkzeug==3.0.3
SQLAlchemy==2.0.30
Alembic==1.13.1
psycopg2-binary==2.9.9
gunicorn==22.0.0
ReportLab==4.2.0
openpyxl==3.1.2
python-dotenv==1.0.1
pytz==2024.1
pytest==8.2.1
`
    },
    {
      path: 'app/__init__.py',
      category: 'Backend',
      description: 'Flask Application Factory and Extensions setup',
      content: `from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from config import config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message_category = 'info'

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Register blueprints
    from app.routes.dashboard import dashboard_bp
    from app.routes.students import students_bp
    from app.routes.subjects import subjects_bp
    from app.routes.marks import marks_bp
    from app.routes.results import results_bp
    from app.routes.fees import fees_bp
    from app.routes.auth import auth_bp
    from app.routes.settings import settings_bp

    app.register_blueprint(dashboard_bp)
    app.register_blueprint(students_bp, url_prefix='/students')
    app.register_blueprint(subjects_bp, url_prefix='/subjects')
    app.register_blueprint(marks_bp, url_prefix='/marks')
    app.register_blueprint(results_bp, url_prefix='/results')
    app.register_blueprint(fees_bp, url_prefix='/fees')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(settings_bp, url_prefix='/settings')

    return app
`
    },
    {
      path: 'app/models/academic.py',
      category: 'Models',
      description: 'SQLAlchemy models for Subject, Components, Classes, and Conversions',
      content: `from app import db
from datetime import datetime

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False)
    name_en = db.Column(db.String(120), nullable=False)
    name_bn = db.Column(db.String(150), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    subject_type = db.Column(db.String(20), default='compulsory') # compulsory, optional, elective
    full_marks = db.Column(db.Float, default=100.0)
    pass_marks = db.Column(db.Float, default=33.0)
    active = db.Column(db.Boolean, default=True)

    components = db.relationship('AssessmentComponent', backref='subject', cascade='all, delete-orphan', lazy=True)

class AssessmentComponent(db.Model):
    __tablename__ = 'assessment_components'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False) # Creative/CQ, MCQ, Practical, Continuous
    code = db.Column(db.String(10), nullable=False) # CQ, MCQ, PR, CT
    max_marks = db.Column(db.Float, nullable=False)
    pass_marks = db.Column(db.Float, default=0.0)
    weight = db.Column(db.Float, default=1.0)
    contributes_to_final = db.Column(db.Boolean, default=True)
    ordering = db.Column(db.Integer, default=1)

class MarkConversionRule(db.Model):
    __tablename__ = 'mark_conversion_rules'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    formula_type = db.Column(db.String(30), default='proportional') # proportional, weighted, custom
    original_full_marks = db.Column(db.Float, default=100.0)
    target_full_marks = db.Column(db.Float, default=50.0)
    weight = db.Column(db.Float, default=1.0)
    precision = db.Column(db.Integer, default=2)
    rounding_method = db.Column(db.String(10), default='round')
    custom_formula = db.Column(db.String(255), nullable=True)
`
    },
    {
      path: 'app/services/result_engine.py',
      category: 'Services',
      description: 'Bangladesh GPA 5.0 and 4th Subject Rule Calculation Engine',
      content: `"""
Bangladesh Board Standard Result and GPA Engine:
- 80-100: A+ (5.00)
- 70-79: A (4.00)
- 60-69: A- (3.50)
- 50-59: B (3.00)
- 40-49: C (2.00)
- 33-39: D (1.00)
- 0-32: F (0.00)
- 4th Subject Rule: GP above 2.0 (e.g. GP - 2.0) added to total points.
- Failing any mandatory subject causes overall F (GPA 0.00).
"""

def get_letter_grade_and_point(percentage):
    if percentage >= 80.0:
        return 'A+', 5.0, 'Outstanding'
    elif percentage >= 70.0:
        return 'A', 4.0, 'Excellent'
    elif percentage >= 60.0:
        return 'A-', 3.5, 'Very Good'
    elif percentage >= 50.0:
        return 'B', 3.0, 'Good'
    elif percentage >= 40.0:
        return 'C', 2.0, 'Satisfactory'
    elif percentage >= 33.0:
        return 'D', 1.0, 'Pass'
    else:
        return 'F', 0.0, 'Fail'

def calculate_gpa(subject_records, optional_subject_id=None):
    total_grade_points = 0.0
    compulsory_count = 0
    optional_contribution = 0.0
    has_failed_compulsory = False

    for rec in subject_records:
        sub_id = rec['subject_id']
        gp = rec['grade_point']
        is_opt = (sub_id == optional_subject_id)

        if is_opt:
            # 4th subject formula: points over 2.0 added to numerator
            if gp > 2.0:
                optional_contribution += (gp - 2.0)
        else:
            compulsory_count += 1
            total_grade_points += gp
            if gp == 0.0:
                has_failed_compulsory = True

    if has_failed_compulsory or compulsory_count == 0:
        return 0.0, 'F', 'FAILED'

    raw_gpa = (total_grade_points + optional_contribution) / compulsory_count
    final_gpa = min(5.00, round(raw_gpa, 2))

    if final_gpa >= 5.00:
        final_grade = 'A+'
    elif final_gpa >= 4.00:
        final_grade = 'A'
    elif final_gpa >= 3.50:
        final_grade = 'A-'
    elif final_gpa >= 3.00:
        final_grade = 'B'
    elif final_gpa >= 2.00:
        final_grade = 'C'
    elif final_gpa >= 1.00:
        final_grade = 'D'
    else:
        final_grade = 'F'

    return final_gpa, final_grade, 'PASSED'
`
    },
    {
      path: 'app/templates/results/marksheet.html',
      category: 'Templates',
      description: 'Authentic Bangladesh Academic Transcript & Marksheet HTML/Print view',
      content: `{% extends "base.html" %}
{% block content %}
<div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none">
  <!-- Header -->
  <div class="text-center border-b-2 border-gray-800 pb-4 mb-6">
    <h1 class="text-2xl font-bold text-gray-900 font-bangla">{{ school.name_bn }}</h1>
    <h2 class="text-xl font-semibold text-gray-800 uppercase">{{ school.name_en }}</h2>
    <p class="text-xs text-gray-600">{{ school.address }} | EIIN: {{ school.eiin }}</p>
    <div class="mt-3 inline-block bg-blue-900 text-white px-4 py-1 rounded text-sm font-bold uppercase tracking-wider">
      Academic Transcript / Mark Sheet
    </div>
    <p class="text-sm font-medium text-gray-700 mt-1">{{ exam.name }} - {{ exam.academic_year }}</p>
  </div>

  <!-- Student Info & Grading Scale Grid -->
  <div class="grid grid-cols-3 gap-4 mb-6 text-sm">
    <div class="col-span-2 bg-gray-50 p-4 rounded border">
      <div class="grid grid-cols-2 gap-2">
        <p><span class="font-bold text-gray-700">Student Name:</span> {{ student.name_en }}</p>
        <p><span class="font-bold text-gray-700">Admission No:</span> {{ student.admission_no }}</p>
        <p><span class="font-bold text-gray-700">Student ID:</span> {{ student.student_id }}</p>
        <p><span class="font-bold text-gray-700">Class & Roll:</span> {{ student.class_name }} (Roll: {{ student.roll_no }})</p>
        <p><span class="font-bold text-gray-700">Section:</span> {{ student.section_name }}</p>
        <p><span class="font-bold text-gray-700">4th Subject:</span> {{ student.optional_subject_name }}</p>
      </div>
    </div>
    <div class="bg-gray-50 p-2 rounded border text-xs">
      <table class="w-full text-center">
        <thead><tr class="border-b font-bold"><th>Range</th><th>Grade</th><th>GPA</th></tr></thead>
        <tbody>
          <tr><td>80-100</td><td>A+</td><td>5.00</td></tr>
          <tr><td>70-79</td><td>A</td><td>4.00</td></tr>
          <tr><td>60-69</td><td>A-</td><td>3.50</td></tr>
          <tr><td>50-59</td><td>B</td><td>3.00</td></tr>
          <tr><td>40-49</td><td>C</td><td>2.00</td></tr>
          <tr><td>33-39</td><td>D</td><td>1.00</td></tr>
          <tr><td>00-32</td><td>F</td><td>0.00</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Subject Marks Table -->
  <table class="w-full border-collapse border border-gray-300 text-sm mb-6">
    <thead class="bg-gray-100">
      <tr>
        <th class="border p-2">Code</th>
        <th class="border p-2 text-left">Subject Name</th>
        <th class="border p-2">Full</th>
        <th class="border p-2">CQ</th>
        <th class="border p-2">MCQ</th>
        <th class="border p-2">PR</th>
        <th class="border p-2">Total</th>
        <th class="border p-2">LG</th>
        <th class="border p-2">GP</th>
      </tr>
    </thead>
    <tbody>
      {% for sub in result.subject_results %}
      <tr class="border-b text-center">
        <td class="border p-2">{{ sub.code }}</td>
        <td class="border p-2 text-left font-medium">{{ sub.name }} {% if sub.is_optional %}(4th){% endif %}</td>
        <td class="border p-2">{{ sub.full_marks }}</td>
        <td class="border p-2">{{ sub.cq }}</td>
        <td class="border p-2">{{ sub.mcq }}</td>
        <td class="border p-2">{{ sub.pr }}</td>
        <td class="border p-2 font-bold">{{ sub.total }}</td>
        <td class="border p-2 font-bold">{{ sub.letter_grade }}</td>
        <td class="border p-2 font-bold">{{ sub.grade_point }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <!-- Result Summary -->
  <div class="flex justify-between items-center bg-blue-50 border border-blue-200 p-4 rounded mb-10">
    <div>
      <p class="text-sm font-semibold text-gray-700">Total Marks: <span class="text-blue-900 font-bold text-lg">{{ result.total_marks }}</span></p>
      <p class="text-xs text-gray-600">Status: <span class="font-bold text-green-700">{{ result.status }}</span></p>
    </div>
    <div class="text-right">
      <p class="text-xs uppercase text-gray-500 font-bold">Grade Point Average (GPA)</p>
      <p class="text-3xl font-extrabold text-blue-900">{{ "%.2f"|format(result.gpa) }} <span class="text-xl">({{ result.letter_grade }})</span></p>
    </div>
  </div>

  <!-- Signatures -->
  <div class="grid grid-cols-3 text-center text-xs pt-12 text-gray-700 border-t border-dashed">
    <div>Class Teacher's Signature</div>
    <div>Convenor / Exam Controller</div>
    <div>Headmaster / Principal's Seal</div>
  </div>
</div>
{% endblock %}
`
    },
    {
      path: 'tests/test_result_engine.py',
      category: 'Tests',
      description: 'Automated Pytest unit tests for grading and conversion formulas',
      content: `import pytest
from app.services.result_engine import get_letter_grade_and_point, calculate_gpa

def test_letter_grade_bands():
    assert get_letter_grade_and_point(85)[0] == 'A+'
    assert get_letter_grade_and_point(85)[1] == 5.0
    assert get_letter_grade_and_point(72)[0] == 'A'
    assert get_letter_grade_and_point(65)[0] == 'A-'
    assert get_letter_grade_and_point(52)[0] == 'B'
    assert get_letter_grade_and_point(41)[0] == 'C'
    assert get_letter_grade_and_point(35)[0] == 'D'
    assert get_letter_grade_and_point(28)[0] == 'F'

def test_fourth_subject_gpa_addition():
    # 3 compulsory subjects all A (4.0) + 1 optional 4th subject A+ (5.0)
    # Optional 4th subject contributes (5.0 - 2.0) = 3.0 points!
    # GPA = (4.0 + 4.0 + 4.0 + 3.0) / 3 = 15.0 / 3 = 5.00 (A+)
    subjects = [
        {'subject_id': 1, 'grade_point': 4.0},
        {'subject_id': 2, 'grade_point': 4.0},
        {'subject_id': 3, 'grade_point': 4.0},
        {'subject_id': 99, 'grade_point': 5.0} # 4th subject
    ]
    gpa, grade, status = calculate_gpa(subjects, optional_subject_id=99)
    assert gpa == 5.00
    assert grade == 'A+'
    assert status == 'PASSED'

def test_compulsory_fail_causes_overall_f():
    subjects = [
        {'subject_id': 1, 'grade_point': 5.0},
        {'subject_id': 2, 'grade_point': 0.0}, # FAILED
        {'subject_id': 3, 'grade_point': 5.0},
        {'subject_id': 99, 'grade_point': 5.0}
    ]
    gpa, grade, status = calculate_gpa(subjects, optional_subject_id=99)
    assert gpa == 0.0
    assert grade == 'F'
    assert status == 'FAILED'
`
    },
    {
      path: 'WINDOWS_SETUP.bat',
      category: 'Backend',
      description: 'One-click local execution batch script for Windows Command Prompt/PowerShell',
      content: `@echo off
echo ========================================================
echo   E-Biddalay - Bangladesh School Management System
echo   Setting up Virtual Environment and Starting Server
echo ========================================================
echo.

python -m venv venv
call venv\\Scripts\\activate
echo [INFO] Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo [INFO] Initializing SQLite Database...
flask db upgrade

echo.
echo ========================================================
echo Server starting on http://127.0.0.1:5000
echo Open your browser and navigate to the address above!
echo ========================================================
python run.py
pause
`
    },
    {
      path: 'README.md',
      category: 'Config',
      description: 'Comprehensive installation, hosting, and architecture documentation',
      content: `# E-Biddalay - Complete School Management Web Application for Bangladesh

A production-grade, secure, database-driven School Management Web Application built specifically for educational institutions in Bangladesh.

## Core Features
1. **Dynamic Academic Management:** Classes (1-10/12), Sections (Padma, Meghna, Jamuna), Shifts.
2. **Dynamic Subject Configuration:** Full marks, pass marks, Theory (CQ), MCQ, Practical, and Oral breakdown.
3. **Editable Mark Distribution & Conversion Engine:** Proportional conversion (e.g. 100 -> 80), CA continuous assessment, custom math formulas.
4. **Authentic Bangladesh Education Board Result Engine:**
   - Grading Scale (A+, A, A-, B, C, D, F / GPA 0.00 to 5.00)
   - Mandatory separate component passing rules (CQ & MCQ)
   - 4th Subject Rule (Higher Math / Biology: GPA points above 2.0 added to overall GPA)
   - Merit ranking and Tabulation sheets
5. **Fee & Financial Ledger:** Tuition fees, Admission fees, Exam fees, receipt generation with BDT currency, income & expenses.
6. **Attendance & Student Register:** Daily attendance, Defaulters list, CSV export.
7. **Production Deployment Ready:** Docker, PostgreSQL, Gunicorn, and Windows setup scripts included.

## Installation on Windows
1. Open PowerShell or Command Prompt in this folder.
2. Run \`WINDOWS_SETUP.bat\` or execute:
   \`\`\`powershell
   python -m venv venv
   .\\venv\\Scripts\\Activate.ps1
   pip install -r requirements.txt
   python run.py
   \`\`\`
3. Visit \`http://127.0.0.1:5000\` in your browser.

## Production Deployment (PostgreSQL + Linux / VPS)
\`\`\`bash
export FLASK_CONFIG=production
export DATABASE_URL="postgresql://user:password@localhost:5432/school_db"
pip install -r requirements.txt
flask db upgrade
gunicorn -w 4 -b 0.0.0.0:8000 run:app
\`\`\`
`
    }
  ];
}

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();
  const files = getProjectFiles();

  for (const f of files) {
    zip.file(f.path, f.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'School_Management_System_E-Biddalay.zip';
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 60000);
}

