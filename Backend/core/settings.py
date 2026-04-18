"""
Django settings for core project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta
from mongoengine import connect

# -----------------------------

# BASE DIR + ENV LOAD (IMPORTANT)

# -----------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env properly (force override)

load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)


# ENV VARIABLES

# -----------------------------

SECRET_KEY = os.getenv("SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
HF_API_KEY = os.getenv("HF_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# -----------------------------

# BASIC SETTINGS

# -----------------------------

DEBUG = True
ALLOWED_HOSTS = ["*"]

# -----------------------------

# INSTALLED APPS

# -----------------------------

INSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',
"rest_framework",
"corsheaders",
"users",
"chat",

]

# -----------------------------

# MIDDLEWARE

# -----------------------------

MIDDLEWARE = [
"corsheaders.middleware.CorsMiddleware",
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# -----------------------------

# TEMPLATES

# -----------------------------

TEMPLATES = [
{
'BACKEND': 'django.template.backends.django.DjangoTemplates',
'DIRS': [],
'APP_DIRS': True,
'OPTIONS': {
'context_processors': [
'django.template.context_processors.request',
'django.contrib.auth.context_processors.auth',
'django.contrib.messages.context_processors.messages',
],
},
},
]

WSGI_APPLICATION = 'core.wsgi.application'

# -----------------------------

# DATABASE (kept for Django internal use)

# -----------------------------

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.sqlite3',
'NAME': BASE_DIR / 'db.sqlite3',
}
}

# -----------------------------

# MONGODB (PRIMARY DB)

# -----------------------------

connect(
db="screener",
host=MONGO_URI
)

# -----------------------------

# PASSWORD VALIDATION

# -----------------------------

AUTH_PASSWORD_VALIDATORS = [
{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
{'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
{'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
{'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -----------------------------

# INTERNATIONALIZATION

# -----------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -----------------------------

# STATIC FILES

# -----------------------------

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------

# CORS

# -----------------------------

CORS_ALLOW_ALL_ORIGINS = True

# -----------------------------

# JWT SETTINGS

# -----------------------------

SIMPLE_JWT = {
"ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
"REFRESH_TOKEN_LIFETIME": timedelta(days=7),
"AUTH_HEADER_TYPES": ("Bearer",),
}
