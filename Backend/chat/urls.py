from django.urls import path
from .views import send_message, list_user_chats, get_chat_history, delete_chat, get_results

urlpatterns = [
    path("message/", send_message),
    path("list/", list_user_chats),
    path("history/<str:chat_id>/", get_chat_history),
    path("delete/<str:chat_id>/", delete_chat),
    path("results/", get_results),   # ✅ ADD THIS
]