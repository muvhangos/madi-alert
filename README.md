# 💧 Madi Alert

A simple and professional water fault reporting application that allows users to create an account, securely log in, report water-related faults, select the fault location on a map, and optionally upload a photo.

Madi Alert was developed as a full-stack web application using **Node.js, Express, JavaScript, HTML, CSS, JWT authentication, and Leaflet maps**.

---

## 🚀 Live Application

**Madi Alert:**
Add your current Render URL here.

**GitHub Repository:**
https://github.com/muvhangos/madi-alert

---

## 📌 Project Overview

Madi Alert provides a simple way for users to report water service problems.

Users can:

* Create an account
* Register using their name and mobile number
* Create a password
* Log in using their mobile number and password
* Report water faults
* Enter a fault description
* Select the fault location on an interactive map
* Upload a photo of the fault
* Submit the report securely
* Log out of their account

The application uses JWT authentication to protect user and reporting endpoints.

---

## ✨ Current Features

### 👤 User Registration

Users can create an account using:

* Full name
* Mobile number
* Password

Passwords are securely hashed using **bcryptjs** before being stored.

---

### 🔐 Password Authentication

Madi Alert now uses password-based authentication.

The authentication flow is:

```text
Register
   ↓
Create Account
   ↓
Login
   ↓
Mobile Number + Password
   ↓
JWT Authentication
   ↓
Madi Alert Reporting Page
```

The previous SMS/PIN verification system has been removed.

There is currently:

* ❌ No SMS verification
* ❌ No PIN verification
* ❌ No verification-code page
* ❌ No Twilio dependency for authentication

---

### 📝 Water Fault Reporting

Authenticated users can report water service problems.

A report can contain:

* Fault/problem type
* Description
* GPS coordinates
* Photo
* Reporting user's account information
* Date/time information

---

### 🗺️ Interactive Map

Madi Alert uses **Leaflet** to provide an interactive map.

Users can click on the map to identify where the water fault occurred.

The application records:

```text
Latitude
Longitude
```

A location is required before a report can be submitted.

---

### 📷 Photo Upload

Users can optionally upload a photo showing the water fault.

The application uses **Multer** to handle uploaded files.

---

### 🔒 Protected API

Reporting endpoints require a valid JWT token.

Authenticated requests use:

```text
Authorization: Bearer <token>
```

Unauthorized users are redirected to the login page.

---

### 🚪 Logout

Users can securely log out of the application.

Logout removes the locally stored authentication information and returns the user to the login page.

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Leaflet.js
* Responsive design

### Backend

* Node.js
* Express.js

### Authentication

* JSON Web Tokens (JWT)
* bcryptjs

### File Uploads

* Multer

### Configuration

* dotenv

### Version Control

* Git
* GitHub

### Deployment

* Render

---

## 📁 Project Structure

```text
madi-alert/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── auth.js
│
├── uploads/
│   └── uploaded fault images
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── users.json
└── reports.json
```

### Important Files

#### `server.js`

Main Express server containing:

* Authentication routes
* JWT authentication middleware
* User registration
* User login
* Logout endpoint
* Fault reporting API
* File upload handling
* Admin functionality
* Health-check endpoint

#### `public/index.html`

Main Madi Alert reporting interface.

It provides:

* User information
* Fault reporting form
* Interactive map
* Photo upload
* Report submission
* Logout

#### `public/auth.js`

Handles:

* Registration
* Login
* Logout
* JWT storage
* User information
* Authentication messages

#### `public/login.html`

User login page.

#### `public/register.html`

New-user registration page.

---

## 🔑 Authentication

Madi Alert uses JWT authentication.

After successful login, the server returns a JWT token.

The frontend stores the authentication information locally:

```text
madiAlertToken
madiAlertUser
```

The token is then sent with protected API requests.

Example:

```http
Authorization: Bearer YOUR_TOKEN
```

Tokens expire after the configured JWT expiration period.

---

## 🌐 API Endpoints

### Health Check

```http
GET /health
```

Returns the current application status.

Example response:

```json
{
  "success": true,
  "app": "Madi Alert",
  "status": "Running"
}
```

---

### Register

```http
POST /api/auth/register
```

Creates a new user account.

Request:

```json
{
  "name": "John Doe",
  "phoneNumber": "+27123456789",
  "password": "password123"
}
```

---

### Login

```http
POST /api/auth/login
```

Authenticates an existing user.

Request:

```json
{
  "phoneNumber": "+27123456789",
  "password": "password123"
}
```

Successful authentication returns a JWT token and user information.

---

### Logout

```http
POST /api/auth/logout
```

Requires authentication.

```http
Authorization: Bearer YOUR_TOKEN
```

---

### Get Reports

```http
GET /api/reports
```

Requires authentication.

---

### Submit Report

```http
POST /api/reports
```

Requires authentication.

The request uses `multipart/form-data` because a photo can be uploaded.

---

### Update Report

```http
PATCH /api/reports/:id
```

Requires authentication.

---

## ⚙️ Installation

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

### 4. Create `.env`

Create a `.env` file in the project root.

Example:

```env
PORT=5000
JWT_SECRET=your-secure-secret
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
```

**Never commit `.env` to GitHub.**

---

## ▶️ Run Locally

Start the application:

```bash
npm start
```

The server should display:

```text
Madi Alert running on port 5000
Open http://localhost:5000
Password authentication enabled.
SMS/PIN authentication disabled.
```

Open:

```text
http://localhost:5000
```

---

## 🧪 Testing the Application

Test the following flow:

### Registration

1. Open the registration page.
2. Enter your name.
3. Enter your mobile number.
4. Create a password.
5. Click **Create Account**.

### Login

1. Enter your mobile number.
2. Enter your password.
3. Click **Login**.
4. Confirm that the Madi Alert reporting page opens.

### Submit a Fault

1. Select the fault/problem.
2. Enter a description.
3. Click the location on the map.
4. Optionally upload a photo.
5. Submit the report.

### Logout

Click **Logout**.

The application should return you to the login page.

---

## 🔒 Security

The following security measures are currently implemented:

* Password hashing with bcryptjs
* JWT authentication
* Protected reporting routes
* Protected report retrieval
* Authentication checks on the frontend
* `.env` excluded from Git
* User data excluded from Git
* Report data excluded from Git
* Backup files excluded from Git

### Important

Do not commit the following files or folders containing private/runtime data:

```text
.env
users.json
reports.json
uploads/
```

---

## ☁️ Deployment

Madi Alert is deployed using **Render**.

The application can be connected to the GitHub repository so that pushes to the `main` branch trigger a new deployment.

### Render Start Command

```bash
npm start
```

### Build/Install

```bash
npm install
```

Environment variables should be configured directly in Render rather than committing them to GitHub.

---

## ⚠️ Current Data Storage

The current version uses local JSON files for runtime data:

```text
users.json
reports.json
```

This is suitable for development and demonstration purposes.

For a production application, the next recommended upgrade is a persistent database such as:

* MongoDB
* PostgreSQL
* MySQL

A database would provide reliable persistence for:

* User accounts
* Password hashes
* Water-fault reports
* Report status
* Uploaded-file references
* Administrative records

This is especially important for deployment environments where local files may not provide permanent storage.

---

## 🔮 Future Improvements

Possible future features include:

* 🗄️ MongoDB/PostgreSQL database
* 👨‍💼 Admin dashboard
* 📊 Report statistics
* 📍 Fault tracking by geographic area
* 🔄 Report status updates
* 📧 Email notifications
* 📱 WhatsApp notifications
* 🗺️ Improved map functionality
* 🔔 User notifications
* 🖼️ Improved image management
* ☁️ Cloud image storage
* 👥 Multiple user roles
* 🛡️ Enhanced security
* 📱 Progressive Web App support

---

## 🎯 Project Goals

The goal of Madi Alert is to provide a simple digital platform that makes it easier for residents to report water service problems and provide accurate information about the location and condition of the fault.

The project also demonstrates practical full-stack development skills including:

* Frontend development
* Backend development
* REST APIs
* Authentication
* Password security
* JWT
* File uploads
* Interactive maps
* Git/GitHub
* Cloud deployment

---

## 👨‍💻 Developer

**Samuel Muvhango**

Full Stack Developer in training.

### Technologies & Skills

* HTML
* CSS
* JavaScript
* Python
* Django
* Node.js
* Express
* React
* MongoDB
* Git
* GitHub
* REST APIs
* Cloud deployment

---

## 📄 License

This project is currently intended for educational, portfolio, and demonstration purposes.

---

## ⭐ Madi Alert

**Report it. Locate it. Fix it.**

💧 Making water fault reporting simpler through technology.
