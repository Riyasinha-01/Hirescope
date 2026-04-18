from mongoengine import Document, StringField, EmailField, DateTimeField
from datetime import datetime


class User(Document):
    email = EmailField(required=True, unique=True)
    name = StringField(required=True)
    image = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "users"
    }
