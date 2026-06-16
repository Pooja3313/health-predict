# Installation & Setup

## Prerequisites

Before running the project, make sure you have:

* Python 3.8 or higher
* Node.js 16 or higher
* MongoDB installed and running
* Google Gemini API Key

---

## 1. Clone the Repository

```bash
git clone https://github.com/Pooja3313/health-predict.git
cd health-prediction-app
```

---

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder using `.env.example`.

Example:

```env
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=health_prediction_db

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

FLASK_ENV=development
SECRET_KEY=your-secret-key
HOST=0.0.0.0
PORT=5000
DEBUG=True
```

Start the backend server:

```bash
python app.py
```

Backend will run on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:3000
```

(or the Vite URL shown in terminal)

---

## 4. MongoDB Setup

Make sure MongoDB is running locally.

Default connection:

```text
mongodb://localhost:27017
```

Database:

```text
health_prediction_db
```

The database and collections will be created automatically.

---

## 5. Gemini API Setup

1. Open Google AI Studio.
2. Generate a free Gemini API key.
3. Add the key to the `.env` file.
4. Restart the backend server.

---

## Application Features

* Create Patient
* View Patients
* Update Patient
* Delete Patient
* Search Patients
* Dashboard Statistics
* AI-Powered Health Risk Prediction
* Responsive Design

---

## Security Note

The `.env` file is intentionally excluded from GitHub.

Please create your own `.env` file using the provided `.env.example` template and add your own Gemini API key.
