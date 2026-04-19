# 🎯 HireScope – AI Tutor Screener

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)]()
[![Django](https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)]()
[![HuggingFace](https://img.shields.io/badge/AI-HuggingFace%20LLaMA%203-FFD21E?logo=huggingface&logoColor=black)]()
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)]()

> An AI-powered interview platform that evaluates tutor candidates on **soft skills** — not just knowledge.

---

## 🌐 Live Links

| | |
|---|---|
| **Frontend** | https://hirescope-interview.vercel.app/ |
| **Backend API** | https://hirescope-qw95.onrender.com |

---

## 🧠 What is HireScope?

HireScope simulates a real tutor screening interview using AI. Instead of testing raw subject knowledge, it evaluates the qualities that make a great tutor:

- **Communication clarity** — Can they explain things simply?
- **Empathy & patience** — How do they handle struggling students?
- **English fluency** — Is their language natural and confident?
- **Warmth** — Do they connect with learners?

Candidates go through a voice-based, conversational interview with an adaptive AI interviewer, and receive a structured evaluation with a final verdict.

---

## ✨ Features

### 🎤 Voice-Based Interaction
- Browser-native **speech-to-text** captures candidate answers
- **Text-to-speech** delivers AI interviewer questions aloud
- Creates a natural, real-interview feel — no typing required

### 🤖 Adaptive AI Interviewer
- Asks **5 dynamic questions** tailored to tutor screening
- **Follows up** based on what the candidate said
- Maintains full conversation context throughout the session

### 📊 Automated Evaluation
After the interview, AI generates a structured scorecard across:

| Dimension | What it measures |
|---|---|
| Clarity | How well they explained concepts |
| Warmth | Empathy and approachability |
| Simplicity | Ability to break down complex ideas |
| Patience | How they handle difficulty or struggle |
| Fluency | Natural and confident English usage |

Each report includes a **final verdict** (Selected / Rejected) backed by evidence from the interview.

### 🔐 Authentication
- Google Sign-In via OAuth
- JWT-based session management
- Secure, user-specific interview history

### 🧾 Interview History
- All past sessions are stored and retrievable
- Candidates and recruiters can review previous evaluations

### 🎥 Immersive UI
- Webcam preview for a realistic interview setup
- Combined voice + chat interface
- View Result to get the evaluation
- Clean, distraction-free flow

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Web Speech API, Axios |
| **Backend** | Django, Django REST Framework |
| **Database** | MongoDB (via MongoEngine) |
| **AI Model** | HuggingFace – LLaMA 3 |
| **Hosting** | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 📁 Project Structure

```
Hirescope/
├── Backend/
│   ├── core/           # App settings and configuration
│   ├── users/          # Authentication and user management
│   ├── chat/           # Interview logic and AI integration
│   └── manage.py
│
└── Frontend/
    └── src/
        ├── components/ # Reusable UI components
        ├── pages/      # Route-level page views
        ├── services/   # API calls and utilities
        └── App.js
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Riyasinha-01/Hirescope.git
cd Hirescope
```

### 2. Set up the backend

```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the `Backend/` directory:

```env
SECRET_KEY=your_django_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
HF_API_KEY=your_huggingface_api_key
MONGO_URI=your_mongodb_connection_string
```

### 4. Run the backend

```bash
python manage.py runserver
```

### 5. Set up and run the frontend

```bash
cd ../Frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel (auto-deploy from GitHub) | https://hirescope-interview.vercel.app/ |
| Backend | Render | https://hirescope-qw95.onrender.com |
| Database | MongoDB Atlas | — |

---

## 🔌 API Reference

### Authentication

#### `POST /api/auth/google/`
Exchange a Google ID token for a JWT.

**Request:**
```json
{ "id_token": "GOOGLE_ID_TOKEN" }
```
**Response:**
```json
{ "access": "JWT_TOKEN" }
```

---

#### `GET /api/auth/profile/`
Retrieve the authenticated user's profile.

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "name": "User Name",
  "email": "user@email.com",
  "image": "profile_url"
}
```

---

### Interview / Chat

#### `POST /api/chat/message/`
Send a message to the AI interviewer.

**Request:**
```json
{
  "message": "Hello",
  "chat_id": "optional_session_id"
}
```
**Response:**
```json
{
  "chat_id": "123",
  "reply": "AI interviewer response"
}
```

---

#### `POST /api/chat/tts/` *(optional)*
Convert text to speech.

**Request:**
```json
{ "text": "Hello" }
```
**Response:** Audio stream (MP3)

---

## 🔄 System Flow

```
User Login → Start Interview → AI Asks Questions → Candidate Answers via Voice
     → AI Follows Up → Evaluation Generated → Result Stored → History Available
```

---

## 🧪 Sample Interview Questions

- *"Can you explain fractions to a 9-year-old who's never heard of them?"*
- *"A student is frustrated and keeps making the same mistake. What do you do?"*
- *"How would you simplify the concept of gravity for a middle schooler?"*

---

## ⚠️ Edge Cases Handled

- Short or vague answers that don't engage meaningfully
- Excessively long responses that need summarisation
- Microphone permission denial
- Session continuity across disconnects
- Unauthorized access attempts

---

## 💡 Planned Improvements

- [ ] Emotion detection via webcam video analysis
- [ ] Cheating / distraction detection via webcam using computer vision and machine learning
- [ ] OpenAI Whisper integration for more accurate speech recognition
- [ ] Multi-language interview support
- [ ] Recruiter dashboard for bulk candidate review

---

## 🙌 Why HireScope Stands Out

HireScope addresses a real-world hiring bottleneck — screening tutors at scale is time-consuming and inconsistent. By automating the soft-skill evaluation layer with AI, it enables:

- **Consistent, bias-reduced** screening across all candidates
- **Faster shortlisting** without sacrificing depth
- **Scalable architecture** ready for enterprise use

---

## 👩‍💻 Author

**Riya Sinha**  
B.Tech Computer Science Engineering (2027)