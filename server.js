const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "madi-alert-secret";

const DATA = path.join(__dirname, "reports.json");
const UPLOADS = path.join(__dirname, "uploads");

if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, "[]");
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOADS));

const upload = multer({
  dest: UPLOADS,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Demo admin account: admin@madzi.local / admin123
const admin = {
  email: "admin@madzi.local",
  passwordHash: bcrypt.hashSync("admin123", 10)
};

function readReports() {
  return JSON.parse(fs.readFileSync(DATA, "utf8"));
}

function saveReports(reports) {
  fs.writeFileSync(DATA, JSON.stringify(reports, null, 2));
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Login required" });
  }
}

app.get("/api/reports", auth, (req, res) => {
  res.json(readReports().sort((a, b) => b.id - a.id));
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email !== admin.email || !bcrypt.compareSync(password || "", admin.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ email, role: "admin" }, SECRET, { expiresIn: "4h" });
  res.json({ token });
});

app.post("/api/reports", upload.single("photo"), (req, res) => {
  const { name, phone, problem, description, latitude, longitude } = req.body;

  if (!problem || !description || !latitude || !longitude) {
    return res.status(400).json({ message: "Problem, description and location are required" });
  }

  const reports = readReports();
  const report = {
    id: Date.now(),
    name: name || "Anonymous",
    phone: phone || "",
    problem,
    description,
    latitude: Number(latitude),
    longitude: Number(longitude),
    photo: req.file ? `/uploads/${req.file.filename}` : null,
    status: "New",
    createdAt: new Date().toISOString()
  };

  reports.push(report);
  saveReports(reports);
  res.status(201).json({ message: "Water fault reported successfully", report });
});

app.patch("/api/reports/:id", auth, (req, res) => {
  const reports = readReports();
  const report = reports.find(r => r.id === Number(req.params.id));
  if (!report) return res.status(404).json({ message: "Report not found" });

  if (!["New", "Investigating", "Fixed"].includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  report.status = req.body.status;
  saveReports(reports);
  res.json(report);
});

app.get("/health", (req, res) => res.json({ success: true, app: "Madi Alert" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Madi Alert running on port ${PORT}`);
});
