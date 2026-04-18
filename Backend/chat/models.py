from mongoengine import Document, ReferenceField, StringField, DateTimeField, IntField
from datetime import datetime
from users.models import User


class ChatSession(Document):
    user = ReferenceField(User, required=True)
    title = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "chat_sessions"
    }


class Message(Document):
    chat = ReferenceField(ChatSession, required=True)
    role = StringField(required=True, choices=["user", "assistant"])
    content = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "messages"
    }

class Result(Document):
    user = ReferenceField(User, required=True)
    chat = ReferenceField('ChatSession', required=True)

    # 🔥 Structured scores
    clarity = IntField()
    warmth = IntField()
    patience = IntField()
    simplicity = IntField()
    fluency = IntField()

    # 🔥 Verdict
    verdict = StringField()

    # 🔥 Raw text (optional but useful)
    result = StringField()

    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "results"
    }