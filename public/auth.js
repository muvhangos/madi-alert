const sendCodeButton =
document.getElementById(
"sendCodeButton"
);

const verifyCodeButton =
document.getElementById(
"verifyCodeButton"
);

const registerButton =
document.getElementById(
"registerButton"
);

if (registerButton) {
registerButton.addEventListener(
"click",
async function () {
const nameInput =
document.getElementById(
"name"
);


  const phoneInput =
    document.getElementById(
      "phoneNumber"
    );

  const message =
    document.getElementById(
      "message"
    );

  const name =
    nameInput
      ? nameInput.value.trim()
      : "";

  const phoneNumber =
    phoneInput
      ? phoneInput.value.trim()
      : "";

  if (
    !name ||
    !phoneNumber
  ) {
    message.textContent =
      "Please enter your name and mobile number.";

    return;
  }

  try {
    registerButton.disabled =
      true;

    registerButton.textContent =
      "Creating Account...";

    message.textContent =
      "";

    const response =
      await fetch(
        "/api/auth/register",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              name:
                name,

              phoneNumber:
                phoneNumber
            })
        }
      );

    const data =
      await response.json();

    message.textContent =
      data.message;

    if (response.ok) {
      registerButton.textContent =
        "Account Created";

      setTimeout(
        function () {
          window.location.href =
            "/login.html";
        },
        1500
      );
    } else {
      registerButton.disabled =
        false;

      registerButton.textContent =
        "Create Account";
    }
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    message.textContent =
      "Unable to create account. Please try again.";

    registerButton.disabled =
      false;

    registerButton.textContent =
      "Create Account";
  }
}


);
}

if (sendCodeButton) {
sendCodeButton.addEventListener(
"click",
async function () {
const phoneInput =
document.getElementById(
"phoneNumber"
);


  const message =
    document.getElementById(
      "message"
    );

  const verificationSection =
    document.getElementById(
      "verificationSection"
    );

  const phoneNumber =
    phoneInput
      ? phoneInput.value.trim()
      : "";

  if (!phoneNumber) {
    message.textContent =
      "Please enter your mobile number.";

    return;
  }

  try {
    sendCodeButton.disabled =
      true;

    sendCodeButton.textContent =
      "Sending...";

    message.textContent =
      "";

    const response =
      await fetch(
        "/api/auth/send-code",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              phoneNumber:
                phoneNumber
            })
        }
      );

    const data =
      await response.json();

    message.textContent =
      data.message;

    if (response.ok) {
      if (
        verificationSection
      ) {
        verificationSection.style.display =
          "block";
      }

      sendCodeButton.textContent =
        "Verification Code Sent";
    } else {
      sendCodeButton.disabled =
        false;

      sendCodeButton.textContent =
        "Send Verification Code";
    }
  } catch (error) {
    console.error(
      "Send code error:",
      error
    );

    message.textContent =
      "Unable to send verification code. Please try again.";

    sendCodeButton.disabled =
      false;

    sendCodeButton.textContent =
      "Send Verification Code";
  }
}


);
}

if (verifyCodeButton) {
verifyCodeButton.addEventListener(
"click",
async function () {
const phoneInput =
document.getElementById(
"phoneNumber"
);


  const verificationCodeInput =
    document.getElementById(
      "verificationCode"
    );

  const message =
    document.getElementById(
      "message"
    );

  const phoneNumber =
    phoneInput
      ? phoneInput.value.trim()
      : "";

  const verificationCode =
    verificationCodeInput
      ? verificationCodeInput.value.trim()
      : "";

  if (
    !phoneNumber ||
    !verificationCode
  ) {
    message.textContent =
      "Please enter your mobile number and verification code.";

    return;
  }

  try {
    verifyCodeButton.disabled =
      true;

    verifyCodeButton.textContent =
      "Logging in...";

    message.textContent =
      "";

    const response =
      await fetch(
        "/api/auth/verify-code",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              phoneNumber:
                phoneNumber,

              verificationCode:
                verificationCode
            })
        }
      );

    const data =
      await response.json();

    message.textContent =
      data.message;

    if (response.ok) {
      localStorage.setItem(
        "madiAlertToken",
        data.token
      );

      localStorage.setItem(
        "madiAlertUser",
        JSON.stringify(
          data.user
        )
      );

      window.location.href =
        "/";
    } else {
      verifyCodeButton.disabled =
        false;

      verifyCodeButton.textContent =
        "Login";
    }
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    message.textContent =
      "Login failed. Please try again.";

    verifyCodeButton.disabled =
      false;

    verifyCodeButton.textContent =
      "Login";
  }
}


);
}
