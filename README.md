# Madi Alert — Very Small Water Fault Reporting App

## 1. Use Case

### System name
**Madi Alert**

### Problem
Residents often see leaking pipes, burst pipes, no-water problems or faulty meters but do not have a simple way to report the problem with its exact location and a photo.

### Main actor
**Resident** — reports a water fault.

### Secondary actor
**Water Administrator** — views reports and changes their status.

### Goal
Allow a resident to submit a small water-fault report containing the problem, description, location and optional photo.

### Main Use Case: Report Water Fault

**Precondition:** The resident has access to the Madi Alert website.

**Main flow:**
1. Resident opens Madi Alert.
2. Resident selects the type of water problem.
3. Resident enters a short description.
4. Resident clicks the map to identify the fault location.
5. Resident optionally adds a photo.
6. Resident submits the report.
7. System validates the required information.
8. System stores the report.
9. System gives the resident a success message.
10. Administrator can later view the report.

**Alternative flows:**
- If the location is missing, the system asks the resident to select a location.
- If required information is missing, the system rejects the report.
- If an administrator enters incorrect login details, access is denied.

**Postcondition:** A new report is saved with status `New`.

### Admin Use Case: Manage Reports

**Precondition:** Administrator has valid login details.

**Main flow:**
1. Administrator opens the login page.
2. Administrator signs in.
3. System authenticates the administrator.
4. Administrator views submitted reports.
5. Administrator changes a report from `New` to `Investigating` or `Fixed`.

**Postcondition:** The report status is updated.

## 2. Functional Requirements

1. The system must allow a resident to report a water fault.
2. The system must record the problem type.
3. The system must record a description.
4. The system must record latitude and longitude.
5. The system should allow an optional photo.
6. The system must give each report a status.
7. The system must protect the administrator dashboard with login.
8. The administrator must be able to update report status.

## 3. Non-Functional Requirements

- Simple and easy to use.
- Mobile-friendly interface.
- Small number of files.
- Images limited to 5 MB.
- Password authentication for the administrator.
- Reports stored locally in JSON for this small prototype.

## 4. Data Used

Each report contains:

`id, name, phone, problem, description, latitude, longitude, photo, status, createdAt`

## 5. Technology

- Node.js
- Express
- HTML/CSS/JavaScript
- Multer for photo uploads
- JWT for admin authentication
- bcryptjs for password hashing
- Leaflet + OpenStreetMap for the map
- JSON file for simple storage

## 6. How to Run

### Step 1 — Open the project

Open the `madi-alert` folder in VS Code.

### Step 2 — Install packages

```bash
npm install
```

### Step 3 — Start the application

```bash
npm start
```

### Step 4 — Open the application

Open:

`http://localhost:5000`

### Admin login

Email:

`admin@madzi.local`

Password:

`admin123`

For a real deployment, change the demo credentials and use an environment variable for the JWT secret.

## 7. Project Structure

```text
madi-alert/
├── server.js
├── package.json
├── README.md
├── .gitignore
├── reports.json
├── uploads/
└── public/
    ├── index.html
    ├── admin.html
    └── login.html
```

## 8. Scope

This is intentionally a **very small bootcamp project**. It demonstrates a complete use case, frontend form, API, authentication, file upload, map location and administrator workflow without introducing a large database or complex framework.
