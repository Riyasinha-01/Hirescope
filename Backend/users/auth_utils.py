import jwt
from django.conf import settings
from users.models import User


def get_user_from_request(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split()[1]
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        user = User.objects(id=decoded["user_id"]).first()
        return user

    except Exception:
        return None
