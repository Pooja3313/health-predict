# ?? Health Prediction Application

A full-stack web application for managing patient blood test records and generating AI-powered health risk predictions using Google Gemini API.

## ? Features

- **Patient Management** - Complete CRUD operations for patient records
- **AI Health Predictions** - Automated health risk assessment using Google Gemini AI
- **Dashboard** - Overview statistics and quick actions
- **Search** - Search patients by name or email
- **Responsive Design** - Works on Mobile, Tablet, and Desktop
- **Validation** - Frontend and backend input validation
- **Toast Notifications** - User-friendly feedback messages

## ??? Tech Stack

| Technology | Purpose |
|------------|---------|
| **React.js (Vite)** | Frontend framework |
| **Tailwind CSS** | Styling & UI |
| **Python Flask** | Backend REST API |
| **MongoDB** | Database |
| **Google Gemini AI** | Health risk predictions |
| **Axios** | HTTP client |
| **React Router** | Client-side routing |
| **React Hot Toast** | Notifications |

## ?? Project Structure

```
health-prediction-app/
??? backend/
?   ??? app.py              # Flask application entry point
?   ??? config/
?   ?   ??? __init__.py
?   ?   ??? config.py       # Configuration & environment variables
?   ??? database/
?   ?   ??? __init__.py
?   ?   ??? connection.py   # MongoDB connection manager
?   ??? models/
?   ?   ??? __init__.py
?   ?   ??? patient.py      # Patient data model
?   ??? controllers/
?   ?   ??? __init__.py
?   ?   ??? patient_controller.py  # Request handlers
?   ??? routes/
?   ?   ??? __init__.py
?   ?   ??? patient_routes.py      # API route definitions
?   ??? services/
?   ?   ??? __init__.py
?   ?   ??? ai_service.py   # Gemini AI integration
?   ??? utils/
?   ?   ??? __init__.py
?   ?   ??? validation.py   # Input validation
?   ??? requirements.txt    # Python dependencies
?   ??? .env.example        # Environment variables template
??? frontend/
?   ??? src/
?   ?   ??? components/     # Reusable UI components
?   ?   ?   ??? Layout.jsx
?   ?   ?   ??? Modal.jsx
?   ?   ?   ??? PatientForm.jsx
?   ?   ?   ??? ConfirmDialog.jsx
?   ?   ?   ??? EmptyState.jsx
?   ?   ?   ??? LoadingSpinner.jsx
?   ?   ??? pages/          # Page components
?   ?   ?   ??? Dashboard.jsx
?   ?   ?   ??? PatientManagement.jsx
?   ?   ?   ??? AddPatient.jsx
?   ?   ?   ??? EditPatient.jsx
?   ?   ??? services/
?   ?   ?   ??? api.js      # Axios API service layer
?   ?   ??? App.jsx         # Main app with routes
?   ?   ??? main.jsx        # Entry point
?   ?   ??? index.css       # Tailwind styles
?   ??? index.html
?   ??? package.json
?   ??? vite.config.js
?   ??? tailwind.config.js
?   ??? postcss.config.js
??? README.md
```

## ?? Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone <repository-url>
cd health-prediction-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### Configure `.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=health_prediction_db

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
FLASK_ENV=development
SECRET_KEY=your-super-secret-key
HOST=0.0.0.0
PORT=5000
DEBUG=True
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
# Create .env file in frontend root if needed:
# VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Ensure MongoDB is running on your machine. If using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. The database `health_prediction_db` will be created automatically

### 5. Run the Application

#### Start Backend Server:

```bash
cd backend
venv\Scripts\activate   # Windows
python app.py
```

The backend will start at `http://localhost:5000`

#### Start Frontend Dev Server:

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to: **http://localhost:3000**

## ?? API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/patients` | Create a new patient |
| `GET` | `/api/patients` | Get all patients (supports `?search=query`) |
| `GET` | `/api/patients/stats` | Get dashboard statistics |
| `GET` | `/api/patients/:id` | Get a single patient |
| `PUT` | `/api/patients/:id` | Update a patient |
| `DELETE` | `/api/patients/:id` | Delete a patient |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/db-status` | Database connection status |

## ?? AI Health Assessment

When creating or updating a patient, the application automatically:

1. Sends Glucose, Haemoglobin, and Cholesterol values to Google Gemini API
2. Generates a health assessment with risk predictions
3. Stores the AI response in the `remarks` field
4. Falls back to threshold-based assessment if API is unavailable

**Example AI Prompt:**
```
Analyze the following blood test values and provide a short health risk assessment:
Glucose: 180
Haemoglobin: 11
Cholesterol: 250
```

## ?? Validation Rules

| Field | Rule |
|-------|------|
| Full Name | Required, 2-100 characters |
| Email | Required, valid email format |
| Date of Birth | Required, cannot be future date |
| Glucose | Required, numeric, 0-500 |
| Haemoglobin | Required, numeric, 0-25 |
| Cholesterol | Required, numeric, 0-500 |
| Remarks | Optional (AI-generated) |

## ?? UI Features

- **Modern healthcare theme** with gradient accents
- **Responsive design** for all screen sizes
- **Dashboard** with stats cards and recent patients
- **Data table** with search functionality
- **Patient details modal** with AI assessment display
- **Loading states** and empty states
- **Toast notifications** for all actions
- **Confirmation dialogs** for delete operations
- **Form validation** with clear error messages

## ?? Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## ?? License

This project is for educational/demonstration purposes.

## ?? Acknowledgments

- Google Gemini AI for health analysis capabilities
- MongoDB for database services
- React, Vite, and Tailwind CSS communities
