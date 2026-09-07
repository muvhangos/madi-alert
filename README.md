# Madi Alert 🚰

## Water Fault Reporting System

Madi Alert is a web-based water fault reporting application designed to help communities report water-related problems quickly and efficiently.

Users can create an account, log in securely, report water faults, provide their location and description, upload optional photographs, and receive an AI-assisted assessment of the reported fault.

---

## 🚀 Features

### User Authentication

* User registration
* Mobile number and password authentication
* Secure password hashing using `bcryptjs`
* JWT-based authentication
* Login and logout
* Protected reporting functionality
* User information associated with submitted reports

### Water Fault Reporting

Users can report water-related problems including:

* Water Leak
* Burst Pipe
* No Water
* Low Water Pressure
* Broken Meter
* Other

Each report can contain:

* Water problem category
* Description
* GPS latitude
* GPS longitude
* Optional photograph
* Reporting user's name
* Reporting user's mobile number
* Report date and time
* Report status
* Priority information
* AI fault assessment

### 📍 Location Services

The application uses browser geolocation and Leaflet maps to help capture the location of a reported water fault.

Reports can contain:

* Latitude
* Longitude
* Map location
* Interactive map display

### 🤖 AI Fault Assistant

Madi Alert includes an AI Fault Assistant powered by OpenAI.

The assistant can analyse the user's reported problem and provide:

* Fault category
* Severity
* Priority
* Confidence
* AI summary
* Recommended action

The AI assessment is advisory and does not replace professional inspection, engineering assessment, or emergency services.

### 📷 Photo Analysis

Users can optionally attach a photograph when reporting a fault.

The image can be analysed by the AI Fault Assistant to provide additional context for the report.

### 🛠️ Admin Dashboard

The administrator dashboard provides an overview of submitted reports.

It includes:

* Total reports
* High-priority reports
* Emergency reports
* No-water reports
* Report search
* Status filtering
* Report details
* Reporter information
* Location information
* Report photographs
* AI fault assessment
* AI recommended action

### 📊 Report Management

Reports can be retrieved and updated through the protected API.

Report statuses can be managed by the administrator.

---

## 🏗️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Leaflet Maps
* Browser Geolocation API

### Backend

* Node.js
* Express.js

### Authentication & Security

* JSON Web Tokens (JWT)
* bcryptjs
* Environment variables with dotenv

### File Uploads

* Multer

### AI

* OpenAI API
* GPT-5.6 Luna

### Data Storage

The current application uses JSON files for lightweight local/runtime data storage:

* `users.json`
* `reports.json`

Uploaded report photographs are stored in:

* `uploads/`

Runtime/private data files are excluded from Git using `.gitignore`.

### Deployment

* GitHub
* Render

---

## 📁 Project Structure

```text
madi-alert/
│
├── public/
│   ├── admin.html
│   ├── auth.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── report.html
│
├── uploads/
│
├── server.js
├── package.json
├── package-lock.json
├── users.json
├── reports.json
├── .env
├── .gitignore
└── README.md
```

> `users.json`, `reports.json`, `uploads/`, and `.env` contain runtime/private information and should not be committed to GitHub.

---

## 🔐 Authentication Flow

The application uses a simple password-based authentication system.

```text
Register
   ↓
Account Created
   ↓
Login
   ↓
JWT Authentication
   ↓
Water Fault Reporting
   ↓
AI Fault Assessment
   ↓
Submit Report
   ↓
Admin Dashboard
```

SMS/PIN verification is not used in the current version.

---

## 🤖 AI Fault Assessment Flow

```text
User enters fault description
          ↓
Optional photograph selected
          ↓
AI Fault Assistant
          ↓
OpenAI API
          ↓
Fault assessment
          ↓
Category
Severity
Priority
Confidence
Summary
Recommended Action
          ↓
Assessment attached to report
```

The AI result is stored together with the report so that administrators can review the assessment later.

---

## 🔌 API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

Creates a new user account.

#### Login

```http
POST /api/auth/login
```

Authenticates the user and returns a JWT.

#### Logout

```http
POST /api/auth/logout
```

Logs the user out on the client side.

---

### AI

#### Analyse Fault

```http
POST /api/ai/analyze
```

Requires authentication.

Accepts:

* Fault description
* Optional photograph

Returns an AI-assisted fault assessment.

---

### Reports

#### Get Reports

```http
GET /api/reports
```

Requires authentication.

Returns submitted reports.

#### Create Report

```http
POST /api/reports
```

Requires authentication.

Creates a new water fault report.

#### Update Report

```http
PATCH /api/reports/:id
```

Requires authentication.

Updates a report.

---

### Health Check

```http
GET /health
```

Returns the application's health/status response.

---

## ⚙️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/muvhangos/madi-alert.git
```

### 2. Open the project

```bash
cd madi-alert
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

JWT_SECRET=your-secure-jwt-secret

ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-secure-admin-password

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5.6-luna
```

Never commit `.env` to GitHub.

### 5. Start the application

```bash
npm start
```

The application will normally be available at:

```text
http://localhost:5000
```

---

## 🧪 Testing the Application

After starting the server:

### User Registration

Open:

```text
http://localhost:5000/register.html
```

Create an account using:

* Name
* Mobile number
* Password

### Login

Open:

```text
http://localhost:5000/login.html
```

Log in using the registered mobile number and password.

### Report a Fault

After logging in:

1. Select the water problem.
2. Enter a description.
3. Allow location access if required.
4. Select an optional photograph.
5. Run the AI Fault Assistant.
6. Review the AI assessment.
7. Submit the report.

### Admin Dashboard

Open:

```text
http://localhost:5000/admin.html
```

The administrator can review submitted reports and their AI assessments.

---

## 🌍 Deployment

Madi Alert is designed to run as a Node.js web service.

The production deployment uses:

```text
GitHub
   ↓
Render
   ↓
Node.js / Express
   ↓
Madi Alert
```

The Render service should use the following build/start configuration:

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

Production environment variables should be configured inside Render rather than committed to GitHub.

---

## 🔑 Environment Variables

The application can use the following environment variables:

| Variable         | Purpose                               |
| ---------------- | ------------------------------------- |
| `PORT`           | Server port                           |
| `JWT_SECRET`     | JWT signing secret                    |
| `ADMIN_EMAIL`    | Administrator login                   |
| `ADMIN_PASSWORD` | Administrator password                |
| `OPENAI_API_KEY` | OpenAI API authentication             |
| `OPENAI_MODEL`   | OpenAI model used by the AI assistant |

### Security

Never publish:

* OpenAI API keys
* JWT secrets
* Admin passwords
* `.env`
* User data
* Private runtime files

These should remain outside the Git repository.

---

## 📦 Dependencies

The main backend dependencies include:

```text
express
bcryptjs
jsonwebtoken
multer
dotenv
openai
nodemailer
```

---

## 🛡️ Security Notes

Madi Alert uses:

* Password hashing
* JWT authentication
* Protected API routes
* Environment variables for secrets
* Git exclusion of private runtime files
* HTML escaping in the admin dashboard

For a production-scale application, additional security measures should be considered, including:

* Database-backed persistence
* Role-based authorization
* Rate limiting
* Input validation
* HTTPS enforcement
* Secure cookie/session strategies
* Audit logging
* Cloud/object storage for photographs

---

## 🔮 Future Improvements

Potential future enhancements include:

* PostgreSQL or MongoDB database
* Dedicated administrator roles
* Email notifications
* WhatsApp notifications
* SMS notifications
* Municipal water utility integration
* Report assignment
* Automatic status notifications
* Advanced analytics
* Report history
* User profile management
* Cloud image storage
* Mobile application
* Offline reporting
* Automatic geographic clustering of incidents

---

## 👨‍💻 Author

**Samuel Muvhango**

Full Stack Developer in training.

### GitHub

`https://github.com/muvhangos`

### Madi Alert Repository

`https://github.com/muvhangos/madi-alert`

---

## 📄 License

This project is currently intended as an educational and portfolio project.

---

## ⚠️ Disclaimer

Madi Alert is a reporting and information system.

AI-generated fault assessments are advisory only. They should not be treated as a substitute for professional inspection, engineering assessment, municipal procedures, or emergency services.

````

### 2. Save it in VS Code

In your project:

```text
C:\Users\USER\Downloads\madi-alert\madi-alert
````

Open:

```text
README.md
```

Replace its contents with the README above and press **Ctrl + S**.

### 3. Push it to GitHub

In PowerShell:

```powershell
cd "C:\Users\USER\Downloads\madi-alert\madi-alert"
```

Then:

```powershell
git status
```

You should see `README.md` as modified.

Run:

```powershell
git add README.md
git commit -m "Update Madi Alert documentation"
git push origin main
```

### 4. Render

Once the push succeeds, your GitHub repository will contain the new README.

If your existing Render service is connected to:

```text
muvhangos/madi-alert
```

and automatic deploys are enabled, **Render should detect the push and deploy the current `main` branch automatically**.

I would **not change your Render environment variables or service settings right now**, because your application is already working with the OpenAI integration. The important thing is to keep the API key and other secrets in Render's environment settings, **not in GitHub**.

If you run the four Git commands above and paste the **`git status` / `git push` output here**, I can check that the GitHub update went through before we touch anything else.
