import requests
from django.conf import settings

HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

def generate_ai_response(conversation_messages):

    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = """
You are a professional interviewer hiring online math tutors for children.

Your job is to conduct a REAL interview, not teach or explain.

STRICT RULES:

1. Ask ONLY ONE question at a time.
2. Keep questions SHORT and TO THE POINT (max 1–2 lines).
3. Do NOT give explanations, hints, or examples unless absolutely required.
4. Do NOT speak like a teacher. Speak like an interviewer.
5. Do NOT praise, evaluate, or give feedback during the interview.
6. Avoid long sentences and avoid multiple questions.
7. Use simple, direct language.
8. Total interview = 5 questions.

STYLE:
- Concise
- Natural
- Professional
- Slightly conversational (like a real human interviewer)

GOOD EXAMPLES:
- "Can you explain fractions to a 7-year-old?"
- "How would you handle a confused student?"
- "How do you keep a child engaged during lessons?"

BAD EXAMPLES:
- Long explanations
- Multiple questions
- Teaching before asking

IMPORTANT:
Only ask the next question based on the candidate’s previous answer.
Never provide evaluation or summary during the interview.
"""

    messages = [{"role": "system", "content": system_prompt}] + conversation_messages

    print("====== FULL MESSAGE PAYLOAD ======")
    for m in messages:
        print(m["role"], ":", m["content"][:80])
    print("===================================")

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return "Error generating response from AI."

    data = response.json()
    return data["choices"][0]["message"]["content"]

def generate_evaluation(conversation_messages):

    url = "https://router.huggingface.co/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {settings.HF_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = """
You are an expert interviewer evaluating a candidate for an online math tutor role for children.
STRICT FORMAT:
You MUST follow this format exactly.

If you do not follow format, response is invalid.

Do NOT ask any question.
Do NOT continue interview.
ONLY return evaluation.
Analyze the full conversation and evaluate the candidate on:

- Clarity (out of 10)
- Warmth (out of 10)
- Patience (out of 10)
- Simplicity of explanation (out of 10)
- English fluency (out of 10)

Also provide:
- 2–3 strengths (with examples from answers)
- 2–3 weaknesses (with examples)
- Final verdict: SHORTLISTED or REJECTED

Format strictly like this:

Clarity: X/10
Warmth: X/10
Patience: X/10
Simplicity: X/10
Fluency: X/10

Strengths:
- ...
- ...

Weaknesses:
- ...
- ...

Verdict:
SHORTLISTED / REJECTED
"""

    messages = [{"role": "system", "content": system_prompt}] + conversation_messages

    payload = {
        "model": HF_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.5
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return "Error generating evaluation."

    data = response.json()
    return data["choices"][0]["message"]["content"]