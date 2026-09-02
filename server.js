
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
const SECRET =
  process.env.JWT_SECRET || "madi-alert-secret";

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "reports.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

/* =========================================================
   FILE SETUP
========================================================= */

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, "[]");
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, {
    recursive: true
  });
}

/* =========================================================
   EXPRESS SETUP
========================================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.static(PUBLIC_DIR));

app.use(
  "/uploads",
  express.static(UPLOADS_DIR)
);

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      Date.now() +
      "-" +
      Math.round(
        Math.random() * 1000000000
      ) +
      extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage: storage
});

/* =========================================================
   USERS
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

function saveUsers(users) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(
      users,
      null,
      2
    )
  );
}

/* =========================================================
   REPORTS
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

function saveReports(reports) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(
      reports,
      null,
      2
    )
  );
}

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function auth(req, res, next) {
  const authorization =
    req.headers.authorization || "";

  if (
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      success: false,
      message: "Login required."
    });
  }

  const token =
    authorization.substring(7);

  try {
    req.user = jwt.verify(
      token,
      SECRET
    );

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired login."
    });
  }
}

/* =========================================================
   SMSMESSENGER CONFIGURATION
========================================================= */

const smsMessengerEmail =
  process.env.SMSMESSENGER_EMAIL;

const smsMessengerApiToken =
  process.env.SMSMESSENGER_API_TOKEN;

const smsMessengerApiUrl =
  "https://sms1.smsmessenger.co.za/app/api/rest/v1/sms/send.json";

if (
  smsMessengerEmail &&
  smsMessengerApiToken
) {
  console.log(
    "SMSMessenger SMS service configured."
  );
} else {
  console.log(
    "WARNING: SMSMessenger is not fully configured."
  );
}

/* =========================================================
   VERIFICATION CODES
========================================================= */

const verificationCodes =
  new Map();

function generateVerificationCode() {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
}

function normalizePhoneNumber(
  phoneNumber
) {
  return String(
    phoneNumber || ""
  )
    .trim()
    .replace(
      /[\s()-]/g,
      ""
    );
}

/*
  SMSMessenger expects the South African
  international number without the + sign.

  Example:

  +27724955002

  becomes:

  27724955002
*/

function smsMessengerPhoneNumber(
  phoneNumber
) {
  return normalizePhoneNumber(
    phoneNumber
  ).replace(
    /^\+/,
    ""
  );
}

/* =========================================================
   SEND SMS THROUGH SMSMESSENGER
========================================================= */

async function sendSms(
  phoneNumber,
  message
) {
  if (
    !smsMessengerEmail ||
    !smsMessengerApiToken
  ) {
    throw new Error(
      "SMSMessenger is not configured."
    );
  }

  const recipientNumber =
    smsMessengerPhoneNumber(
      phoneNumber
    );

  const response =
    await fetch(
      smsMessengerApiUrl,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          email:
            smsMessengerEmail,

          token:
            smsMessengerApiToken
        },

        body: JSON.stringify({
          recipientNumber:
            recipientNumber,

          message:
            message
        })
      }
    );

  const responseText =
    await response.text();

  let responseData;

  try {
    responseData =
      JSON.parse(
        responseText
      );
  } catch (error) {
    responseData = {
      raw: responseText
    };
  }

  if (!response.ok) {
    throw new Error(
      "SMSMessenger HTTP " +
        response.status +
        ": " +
        JSON.stringify(
          responseData
        )
    );
  }

  if (
    responseData &&
    responseData.error
  ) {
    throw new Error(
      "SMSMessenger API error: " +
        responseData.error
    );
  }

  return responseData;
}

/* =========================================================
   HOME PAGE
========================================================= */

app.get(
  "/",
  function (req, res) {
    const indexPage =
      path.join(
        PUBLIC_DIR,
        "index.html"
      );

    const loginPage =
      path.join(
        PUBLIC_DIR,
        "login.html"
      );

    if (
      fs.existsSync(
        indexPage
      )
    ) {
      return res.sendFile(
        indexPage
      );
    }

    if (
      fs.existsSync(
        loginPage
      )
    ) {
      return res.sendFile(
        loginPage
      );
    }

    return res
      .status(404)
      .send(
        "Madi Alert home page not found."
      );
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/health",
  function (req, res) {
    return res.json({
      success: true,
      app: "Madi Alert",
      status: "Running"
    });
  }
);

/* =========================================================
   USER REGISTRATION
========================================================= */

app.post(
  "/api/auth/register",
  function (req, res) {
    const name = String(
      req.body.name || ""
    ).trim();

    const phoneNumber =
      normalizePhoneNumber(
        req.body.phoneNumber
      );

    if (
      !name ||
      !phoneNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name and mobile number are required."
      });
    }

    if (
      !phoneNumber.startsWith(
        "+"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your mobile number with the country code. Example: +27821234567"
      });
    }

    const users =
      readUsers();

    const existingUser =
      users.find(
        function (user) {
          return (
            user.phoneNumber ===
            phoneNumber
          );
        }
      );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this mobile number already exists."
      });
    }

    const user = {
      id: Date.now(),

      name:
        name,

      phoneNumber:
        phoneNumber,

      createdAt:
        new Date().toISOString()
    };

    users.push(user);

    saveUsers(users);

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully. Please login."
    });
  }
);

/* =========================================================
   SEND VERIFICATION CODE
========================================================= */

app.post(
  "/api/auth/send-code",
  async function (req, res) {
    const phoneNumber =
      normalizePhoneNumber(
        req.body.phoneNumber
      );

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile phone number is required."
      });
    }

    if (
      !phoneNumber.startsWith(
        "+"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your mobile number with the country code. Example: +27821234567"
      });
    }

    const users =
      readUsers();

    const user =
      users.find(
        function (item) {
          return (
            item.phoneNumber ===
            phoneNumber
          );
        }
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found. Please create an account first."
      });
    }

    if (
      !smsMessengerEmail ||
      !smsMessengerApiToken
    ) {
      return res.status(500).json({
        success: false,
        message:
          "SMS service is not configured. Please check the SMSMessenger settings in the server .env file."
      });
    }

    const verificationCode =
      generateVerificationCode();

    verificationCodes.set(
      phoneNumber,
      {
        code:
          verificationCode,

        expiresAt:
          Date.now() +
          5 * 60 * 1000
      }
    );

    const message =
      "Madi Alert verification code: " +
      verificationCode +
      ". This code expires in 5 minutes.";

    try {
      const smsResult =
        await sendSms(
          phoneNumber,
          message
        );

      console.log(
        "SMS verification code sent to:",
        phoneNumber
      );

      console.log(
        "SMSMessenger response:",
        smsResult
      );

      return res.json({
        success: true,

        message:
          "Verification code sent to your mobile phone."
      });
    } catch (error) {
      console.error(
        "SMSMESSENGER SMS ERROR:",
        error.message
      );

      verificationCodes.delete(
        phoneNumber
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to send verification SMS. Please try again."
      });
    }
  }
);

/* =========================================================
   VERIFY CODE
========================================================= */

app.post(
  "/api/auth/verify-code",
  function (req, res) {
    const phoneNumber =
      normalizePhoneNumber(
        req.body.phoneNumber
      );

    const verificationCode =
      String(
        req.body.verificationCode ||
          ""
      ).trim();

    if (
      !phoneNumber ||
      !verificationCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number and verification code are required."
      });
    }

    const stored =
      verificationCodes.get(
        phoneNumber
      );

    if (!stored) {
      return res.status(400).json({
        success: false,
        message:
          "Verification code not found. Please request a new code."
      });
    }

    if (
      Date.now() >
      stored.expiresAt
    ) {
      verificationCodes.delete(
        phoneNumber
      );

      return res.status(400).json({
        success: false,
        message:
          "Verification code has expired. Please request a new code."
      });
    }

    if (
      stored.code !==
      verificationCode
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect verification code."
      });
    }

    const users =
      readUsers();

    const user =
      users.find(
        function (item) {
          return (
            item.phoneNumber ===
            phoneNumber
          );
        }
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found."
      });
    }

    const token =
      jwt.sign(
        {
          id:
            user.id,

          name:
            user.name,

          phoneNumber:
            user.phoneNumber,

          role:
            "user"
        },

        SECRET,

        {
          expiresIn:
            "4h"
        }
      );

    verificationCodes.delete(
      phoneNumber
    );

    return res.json({
      success: true,

      message:
        "Login successful.",

      token:
        token,

      user:
        user
    });
  }
);

/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminEmail =
  (
    process.env.ADMIN_EMAIL ||
    "admin@madi.local"
  )
    .trim()
    .toLowerCase();

const adminPassword =
  process.env.ADMIN_PASSWORD ||
  "admin123";

const adminPasswordHash =
  bcrypt.hashSync(
    adminPassword,
    10
  );

app.post(
  "/api/login",
  function (req, res) {
    const email =
      String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        req.body.password || ""
      );

    const validEmail =
      email === adminEmail;

    const validPassword =
      bcrypt.compareSync(
        password,
        adminPasswordHash
      );

    if (
      !validEmail ||
      !validPassword
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password."
      });
    }

    const token =
      jwt.sign(
        {
          email:
            adminEmail,

          role:
            "admin"
        },

        SECRET,

        {
          expiresIn:
            "4h"
        }
      );

    return res.json({
      success: true,

      message:
        "Admin login successful.",

      token:
        token
    });
  }
);

/* =========================================================
   GET REPORTS
========================================================= */

app.get(
  "/api/reports",
  auth,
  function (req, res) {
    const reports =
      readReports();

    reports.sort(
      function (a, b) {
        return b.id - a.id;
      }
    );

    return res.json(
      reports
    );
  }
);

/* =========================================================
   CREATE REPORT
========================================================= */

app.post(
  "/api/reports",
  auth,
  upload.single("photo"),
  function (req, res) {
    const name =
      String(
        req.body.name ||
          req.user.name ||
          "Anonymous"
      ).trim();

    const phone =
      String(
        req.body.phone ||
          req.user.phoneNumber ||
          ""
      ).trim();

    const problem =
      String(
        req.body.problem ||
          ""
      ).trim();

    const description =
      String(
        req.body.description ||
          ""
      ).trim();

    const latitude =
      Number(
        req.body.latitude
      );

    const longitude =
      Number(
        req.body.longitude
      );

    if (
      !problem ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Problem and description are required."
      });
    }

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid location coordinates are required."
      });
    }

    const reports =
      readReports();

    const report = {
      id:
        Date.now(),

      userId:
        req.user.id ||
        null,

      phoneNumber:
        req.user.phoneNumber ||
        "",

      name:
        name,

      phone:
        phone,

      problem:
        problem,

      description:
        description,

      latitude:
        latitude,

      longitude:
        longitude,

      photo:
        req.file
          ? "/uploads/" +
            req.file.filename
          : null,

      status:
        "New",

      createdAt:
        new Date().toISOString()
    };

    reports.push(
      report
    );

    saveReports(
      reports
    );

    return res.status(201).json({
      success: true,

      message:
        "Water fault reported successfully.",

      report:
        report
    });
  }
);

/* =========================================================
   UPDATE REPORT STATUS
========================================================= */

app.patch(
  "/api/reports/:id",
  auth,
  function (req, res) {
    const reports =
      readReports();

    const report =
      reports.find(
        function (item) {
          return (
            item.id ===
            Number(
              req.params.id
            )
          );
        }
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Report not found."
      });
    }

    const allowedStatuses = [
      "New",
      "Investigating",
      "Fixed"
    ];

    if (
      !allowedStatuses.includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status."
      });
    }

    report.status =
      req.body.status;

    saveReports(
      reports
    );

    return res.json({
      success: true,

      message:
        "Report status updated.",

      report:
        report
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  function () {
    console.log(
      "=============================================="
    );

    console.log(
      "Madi Alert running on port " +
        PORT
    );

    console.log(
      "Open http://localhost:" +
        PORT
    );

    console.log(
      "=============================================="
    );
  }
);

