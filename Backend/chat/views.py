from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.auth_utils import get_user_from_request
from .models import ChatSession, Message, Result
from datetime import datetime
from bson import ObjectId
from chat.gemini_service import generate_ai_response, generate_evaluation
import re


# 🔥 Parse evaluation into structured fields
def parse_evaluation(text):
    def extract_score(label):
        match = re.search(rf"{label}:\s*(\d+)", text)
        return int(match.group(1)) if match else None

    verdict_match = re.search(r"Verdict:\s*(\w+)", text)

    return {
        "clarity": extract_score("Clarity"),
        "warmth": extract_score("Warmth"),
        "patience": extract_score("Patience"),
        "simplicity": extract_score("Simplicity"),
        "fluency": extract_score("Fluency"),
        "verdict": verdict_match.group(1) if verdict_match else None
    }


@api_view(["POST"])
def send_message(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    message_text = request.data.get("message")
    chat_id = request.data.get("chat_id")

    if not message_text:
        return Response({"error": "Message is required"}, status=400)

    # 🔹 Get or create chat
    if chat_id:
        chat = ChatSession.objects(id=chat_id, user=user).first()
        if not chat:
            return Response({"error": "Chat not found"}, status=404)
    else:
        chat = ChatSession(
            user=user,
            title=message_text[:30]
        )
        chat.save()

    # 🔥 OPTIONAL (recommended): stop further interaction if result already exists
    existing_result = Result.objects(chat=chat).first()
    if existing_result:
        return Response({
            "chat_id": str(chat.id),
            "reply": "Interview already completed."
        })

    # 🔹 Save user message
    Message(
        chat=chat,
        role="user",
        content=message_text
    ).save()

    # 🔥 Fetch full conversation
    previous_messages = Message.objects(chat=chat).order_by("created_at")

    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
    ]

    # ✅ Count assistant messages
    assistant_count = Message.objects(chat=chat, role="assistant").count()

    try:
        if assistant_count < 5:
            ai_response = generate_ai_response(conversation_history)

        else:
            ai_response = generate_evaluation(conversation_history)

            parsed = parse_evaluation(ai_response)

            if not parsed["verdict"]:
            # 🔁 retry once
                ai_response = generate_evaluation(conversation_history)
                parsed = parse_evaluation(ai_response)

                # ❌ still failed
                if not parsed["verdict"]:
                    return Response({
                        "chat_id": str(chat.id),
                        "reply": "Evaluation failed. Please try again."
                    })

            Result(
                user=user,
                chat=chat,
                result=ai_response,
                clarity=parsed["clarity"],
                warmth=parsed["warmth"],
                patience=parsed["patience"],
                simplicity=parsed["simplicity"],
                fluency=parsed["fluency"],
                verdict=parsed["verdict"]
            ).save()

        if isinstance(ai_response, dict) and "error" in ai_response:
            return Response(ai_response, status=500)

        ai_response_text = ai_response

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    # 🔹 Save assistant reply
    Message(
        chat=chat,
        role="assistant",
        content=ai_response_text
    ).save()

    return Response({
        "chat_id": str(chat.id),
        "reply": ai_response_text
    })


@api_view(["GET"])
def get_chat_history(request, chat_id):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    chat = ChatSession.objects(id=ObjectId(chat_id), user=user).first()

    if not chat:
        return Response({"error": "Chat not found"}, status=404)

    messages = Message.objects(chat=chat).order_by("created_at")

    data = [
        {
            "role": msg.role,
            "content": msg.content
        }
        for msg in messages
    ]

    return Response({
        "chat_id": str(chat.id),
        "messages": data
    })


@api_view(["GET"])
def list_user_chats(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    chats = ChatSession.objects(user=user).order_by("-created_at")

    data = [
        {
            "chat_id": str(chat.id),
            "title": chat.title,
            "created_at": chat.created_at
        }
        for chat in chats
    ]

    return Response(data)


@api_view(["DELETE"])
def delete_chat(request, chat_id):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    chat = ChatSession.objects(id=chat_id, user=user).first()

    if not chat:
        return Response({"error": "Chat not found"}, status=404)

    Message.objects(chat=chat).delete()
    chat.delete()

    return Response({"message": "Chat deleted successfully"})


# 🔥 NEW: Fetch results for logged-in user
@api_view(["GET"])
def get_results(request):
    user = get_user_from_request(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    results = Result.objects(user=user).order_by("-created_at")

    data = [
        {
            "result": r.result,
            "chat": str(r.chat.id),   
            "clarity": r.clarity,
            "warmth": r.warmth,
            "patience": r.patience,
            "simplicity": r.simplicity,
            "fluency": r.fluency,
            "verdict": r.verdict,
            "date": r.created_at
        }
        for r in results
    ]

    return Response(data)