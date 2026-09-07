require("dotenv").config();

const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "madi-alert-secret";

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "reports.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

/* =========================================================
   CREATE REQUIRED FILES / FOLDERS
========================================================= */

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
}

/* =========================================================
   EXPRESS CONFIGURATION
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(PUBLIC_DIR));

app.use(
    "/uploads",
    express.static(UPLOADS_DIR)
);

/* =========================================================
   MULTER - REPORT PHOTO UPLOADS
========================================================= */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const filename =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            extension;

        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {
        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only image files are allowed."
                )
            );
        }
    }
});

/* =========================================================
   AI PHOTO UPLOAD
   Memory storage is used because the image is sent
   directly to OpenAI and does not need to be saved.
========================================================= */

const aiUpload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {
        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only image files can be analyzed by the AI assistant."
                )
            );
        }
    }
});

/* =========================================================
   OPENAI CONFIGURATION
========================================================= */

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
      })
    : null;

/*
   You can change this in .env:

   OPENAI_MODEL=gpt-5.6-luna

   Keeping it in an environment variable means the model
   can be changed without editing server.js.
*/

const OPENAI_MODEL =
    process.env.OPENAI_MODEL || "gpt-5.6-luna";

/* =========================================================
   PHONE NUMBER NORMALIZATION
========================================================= */

function normalizePhoneNumber(phone) {
    return String(phone || "")
        .trim()
        .replace(/\s+/g, "");
}

/* =========================================================
   READ USERS
========================================================= */

function readUsers() {
    try {
        const data = fs.readFileSync(
            USERS_FILE,
            "utf8"
        );

        const users = JSON.parse(data);

        return Array.isArray(users)
            ? users
            : [];
    } catch (error) {
        console.error(
            "Unable to read users.json:",
            error.message
        );

        return [];
    }
}

/* =========================================================
   SAVE USERS
========================================================= */

function saveUsers(users) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

/* =========================================================
   READ REPORTS
========================================================= */

function readReports() {
    try {
        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        const reports = JSON.parse(data);

        return Array.isArray(reports)
            ? reports
            : [];
    } catch (error) {
        console.error(
            "Unable to read reports.json:",
            error.message
        );

        return [];
    }
}

/* =========================================================
   SAVE REPORTS
========================================================= */

function saveReports(reports) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(reports, null, 2),
        "utf8"
    );
}

/* =========================================================
   JWT AUTHENTICATION MIDDLEWARE
========================================================= */

function auth(req, res, next) {
    const authorization =
        req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const token =
        authorization.substring(7);

    try {
        const decoded = jwt.verify(
            token,
            SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

/* =========================================================
   HOME PAGE
========================================================= */

app.get("/", function (req, res) {
    res.sendFile(
        path.join(
            PUBLIC_DIR,
            "index.html"
        )
    );
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", function (req, res) {
    res.json({
        success: true,
        message: "Madi Alert server is running.",
        aiConfigured: Boolean(openai),
        authentication: "password",
        smsAuthentication: false
    });
});

/* =========================================================
   USER REGISTRATION
========================================================= */

app.post(
    "/api/auth/register",
    async function (req, res) {
        try {
            const name =
                String(
                    req.body.name || ""
                ).trim();

            const phoneNumber =
                normalizePhoneNumber(
                    req.body.phoneNumber
                );

            const password =
                String(
                    req.body.password || ""
                );

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required."
                });
            }

            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mobile number is required."
                });
            }

            if (!phoneNumber.startsWith("+")) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Enter your mobile number with the country code, for example +27724955002."
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters."
                });
            }

            const users = readUsers();

            const existingUser =
                users.find(function (user) {
                    return (
                        user.phoneNumber ===
                        phoneNumber
                    );
                });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this mobile number already exists."
                });
            }

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );

            const user = {
                id: Date.now(),
                name: name,
                phoneNumber: phoneNumber,
                passwordHash: passwordHash,
                createdAt:
                    new Date().toISOString()
            };

            users.push(user);

            saveUsers(users);

            return res.status(201).json({
                success: true,
                message:
                    "Account created successfully.",
                user: {
                    id: user.id,
                    name: user.name,
                    phoneNumber:
                        user.phoneNumber
                }
            });
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create the account."
            });
        }
    }
);

/* =========================================================
   USER LOGIN
========================================================= */

app.post(
    "/api/auth/login",
    async function (req, res) {
        try {
            const phoneNumber =
                normalizePhoneNumber(
                    req.body.phoneNumber
                );

            const password =
                String(
                    req.body.password || ""
                );

            if (!phoneNumber || !password) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Mobile number and password are required."
                });
            }

            const users = readUsers();

            const user =
                users.find(function (item) {
                    return (
                        item.phoneNumber ===
                        phoneNumber
                    );
                });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "No account found. Please create an account first."
                });
            }

            const passwordMatches =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Incorrect mobile number or password."
                });
            }

            const token =
                jwt.sign(
                    {
                        id: user.id,
                        name: user.name,
                        phoneNumber:
                            user.phoneNumber
                    },
                    SECRET,
                    {
                        expiresIn: "4h"
                    }
                );

            return res.json({
                success: true,
                message:
                    "Login successful.",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    phoneNumber:
                        user.phoneNumber
                }
            });
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to log in."
            });
        }
    }
);

/* =========================================================
   USER LOGOUT
========================================================= */

app.post(
    "/api/auth/logout",
    auth,
    function (req, res) {
        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    }
);

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
    "/api/login",
    function (req, res) {
        const email =
            String(
                req.body.email || ""
            ).trim();

        const password =
            String(
                req.body.password || ""
            );

        const adminEmail =
            process.env.ADMIN_EMAIL || "";

        const adminPassword =
            process.env.ADMIN_PASSWORD || "";

        if (
            !adminEmail ||
            !adminPassword
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "Admin login is not configured."
            });
        }

        if (
            email !== adminEmail ||
            password !== adminPassword
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid admin credentials."
            });
        }

        const token =
            jwt.sign(
                {
                    role: "admin",
                    email: adminEmail
                },
                SECRET,
                {
                    expiresIn: "4h"
                }
            );

        return res.json({
            success: true,
            message:
                "Admin login successful.",
            token: token
        });
    }
);

/* =========================================================
   AI FAULT ASSISTANT
========================================================= */

app.post(
    "/api/ai/analyze",
    auth,
    aiUpload.single("photo"),
    async function (req, res) {
        if (!openai) {
            return res.status(503).json({
                success: false,
                message:
                    "AI assistant is not configured. Add OPENAI_API_KEY to the server environment."
            });
        }

        const problem =
            String(
                req.body.problem || ""
            ).trim();

        const description =
            String(
                req.body.description || ""
            ).trim();

        if (!problem || !description) {
            return res.status(400).json({
                success: false,
                message:
                    "Problem and description are required for AI analysis."
            });
        }

        try {
            const content = [
                {
                    type: "input_text",

                    text:
                        "Analyze this water service fault for Madi Alert. " +
                        "The result is advisory only and must not claim certainty. " +
                        "Use the user's selected problem and description, " +
                        "plus the image if supplied. " +
                        "Classify the likely fault, severity and operational priority. " +
                        "Keep the summary and recommended action concise and practical.\n\n" +

                        "Selected problem: " +
                        problem +
                        "\n\n" +

                        "User description: " +
                        description
                }
            ];

            /*
              If the user uploaded a photo, convert it to
              a base64 data URL and send it to the model.
            */

            if (req.file) {
                const base64Image =
                    req.file.buffer.toString(
                        "base64"
                    );

                const imageDataUrl =
                    "data:" +
                    req.file.mimetype +
                    ";base64," +
                    base64Image;

                content.push({
                    type: "input_image",
                    image_url:
                        imageDataUrl,
                    detail: "auto"
                });
            }

            const response =
                await openai.responses.create({
                    model: OPENAI_MODEL,

                    instructions:
                        "You are the Madi Alert water-fault triage assistant. " +
                        "Do not provide dangerous repair instructions. " +
                        "Do not claim that an image proves a fault. " +
                        "If evidence is uncertain, say so. " +
                        "Return only the requested structured data.",

                    input: [
                        {
                            role: "user",
                            content: content
                        }
                    ],

                    text: {
                        format: {
                            type: "json_schema",

                            name:
                                "madi_alert_fault_analysis",

                            strict: true,

                            schema: {
                                type: "object",

                                additionalProperties:
                                    false,

                                properties: {
                                    category: {
                                        type: "string",

                                        enum: [
                                            "Water Leak",
                                            "Burst Pipe",
                                            "No Water",
                                            "Low Water Pressure",
                                            "Broken Meter",
                                            "Other"
                                        ]
                                    },

                                    severity: {
                                        type: "string",

                                        enum: [
                                            "Low",
                                            "Medium",
                                            "High",
                                            "Emergency"
                                        ]
                                    },

                                    priority: {
                                        type: "string",

                                        enum: [
                                            "Low",
                                            "Normal",
                                            "High",
                                            "Urgent"
                                        ]
                                    },

                                    confidence: {
                                        type: "string",

                                        enum: [
                                            "Low",
                                            "Medium",
                                            "High"
                                        ]
                                    },

                                    summary: {
                                        type: "string"
                                    },

                                    recommendedAction: {
                                        type: "string"
                                    }
                                },

                                required: [
                                    "category",
                                    "severity",
                                    "priority",
                                    "confidence",
                                    "summary",
                                    "recommendedAction"
                                ]
                            }
                        }
                    }
                });

            let analysis;

            try {
                analysis =
                    JSON.parse(
                        response.output_text
                    );
            } catch (parseError) {
                console.error(
                    "Unable to parse AI response:",
                    parseError.message
                );

                return res.status(502).json({
                    success: false,
                    message:
                        "The AI returned an unexpected response."
                });
            }

            return res.json({
                success: true,
                analysis: analysis
            });
        } catch (error) {
            console.error(
                "AI analysis failed:",
                error
            );

            return res.status(502).json({
                success: false,
                message:
                    "The AI assistant could not analyze this report right now."
            });
        }
    }
);

/* =========================================================
   GET ALL REPORTS
========================================================= */

app.get(
    "/api/reports",
    auth,
    function (req, res) {
        try {
            const reports =
                readReports();

            return res.json({
                success: true,
                reports: reports
            });
        } catch (error) {
            console.error(
                "Get reports error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to retrieve reports."
            });
        }
    }
);

/* =========================================================
   CREATE WATER FAULT REPORT
========================================================= */

app.post(
    "/api/reports",
    auth,
    upload.single("photo"),
    function (req, res) {
        try {
            const name =
                String(
                    req.body.name ||
                        req.user.name ||
                        ""
                ).trim();

            const phone =
                normalizePhoneNumber(
                    req.body.phone ||
                        req.user.phoneNumber
                );

            const problem =
                String(
                    req.body.problem || ""
                ).trim();

            const description =
                String(
                    req.body.description || ""
                ).trim();

            const latitude =
                String(
                    req.body.latitude || ""
                ).trim();

            const longitude =
                String(
                    req.body.longitude || ""
                ).trim();

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name is required."
                });
            }

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Phone number is required."
                });
            }

            if (!problem) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please select the type of water problem."
                });
            }

            if (!description) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please describe the water fault."
                });
            }

            let photoPath = "";

            if (req.file) {
                photoPath =
                    "/uploads/" +
                    req.file.filename;
            }

            /*
              AI information comes from hidden fields
              populated by public/ai.js.
            */

            const aiAnalysis = {
                category: String(
                    req.body.aiCategory || ""
                ).trim(),

                severity: String(
                    req.body.aiSeverity || ""
                ).trim(),

                priority: String(
                    req.body.aiPriority || ""
                ).trim(),

                confidence: String(
                    req.body.aiConfidence || ""
                ).trim(),

                summary: String(
                    req.body.aiSummary || ""
                ).trim(),

                recommendedAction:
                    String(
                        req.body.aiRecommendation ||
                            ""
                    ).trim()
            };

            const reports =
                readReports();

            const report = {
                id: Date.now(),

                userId:
                    req.user.id,

                name: name,

                phone: phone,

                phoneNumber: phone,

                problem: problem,

                description:
                    description,

                latitude:
                    latitude,

                longitude:
                    longitude,

                photo:
                    photoPath,

                status: "New",

                aiAnalysis:
                    aiAnalysis,

                createdAt:
                    new Date().toISOString()
            };

            reports.push(report);

            saveReports(reports);

            return res.status(201).json({
                success: true,
                message:
                    "Water fault reported successfully.",
                report: report
            });
        } catch (error) {
            console.error(
                "Create report error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create the report."
            });
        }
    }
);

/* =========================================================
   UPDATE REPORT STATUS
========================================================= */

app.patch(
    "/api/reports/:id",
    auth,
    function (req, res) {
        try {
            const reportId =
                Number(
                    req.params.id
                );

            const newStatus =
                String(
                    req.body.status || ""
                ).trim();

            const allowedStatuses = [
                "New",
                "Investigating",
                "Fixed"
            ];

            if (
                !allowedStatuses.includes(
                    newStatus
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid report status."
                });
            }

            const reports =
                readReports();

            const reportIndex =
                reports.findIndex(
                    function (report) {
                        return (
                            Number(
                                report.id
                            ) === reportId
                        );
                    }
                );

            if (reportIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Report not found."
                });
            }

            reports[
                reportIndex
            ].status = newStatus;

            reports[
                reportIndex
            ].updatedAt =
                new Date().toISOString();

            saveReports(reports);

            return res.json({
                success: true,
                message:
                    "Report status updated.",
                report:
                    reports[
                        reportIndex
                    ]
            });
        } catch (error) {
            console.error(
                "Update report error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to update the report."
            });
        }
    }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    function (error, req, res, next) {
        console.error(
            "Server error:",
            error
        );

        if (
            error instanceof
            multer.MulterError
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "File upload error: " +
                    error.message
            });
        }

        if (
            error &&
            error.message &&
            (
                error.message.includes(
                    "Only image files"
                ) ||
                error.message.includes(
                    "Only image files can be analyzed"
                )
            )
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "An unexpected server error occurred."
        });
    }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    function () {
        console.log(
            `Madi Alert running on port ${PORT}`
        );

        console.log(
            `Open http://localhost:${PORT}`
        );

        console.log(
            "Password authentication enabled."
        );

        console.log(
            "SMS/PIN authentication disabled."
        );

        if (openai) {
            console.log(
                `AI Fault Assistant enabled (${OPENAI_MODEL}).`
            );
        } else {
            console.log(
                "AI Fault Assistant disabled - OPENAI_API_KEY not configured."
            );
        }
    }
);