document.addEventListener("DOMContentLoaded", function () {
  const registerButton = document.getElementById("registerButton");
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  /*
   * REGISTER
   * Creates an account using:
   * - Name
   * - Phone number
   * - Password
   */
  if (registerButton) {
    registerButton.addEventListener("click", async function () {
      const nameElement = document.getElementById("name");
      const phoneElement = document.getElementById("phoneNumber");
      const passwordElement = document.getElementById("password");
      const messageElement = document.getElementById("message");

      const name = nameElement ? nameElement.value.trim() : "";
      const phoneNumber = phoneElement
        ? phoneElement.value.trim()
        : "";
      const password = passwordElement
        ? passwordElement.value
        : "";

      if (!name || !phoneNumber || !password) {
        showMessage(
          messageElement,
          "Please enter your name, mobile number and password.",
          true
        );
        return;
      }

      if (!phoneNumber.startsWith("+")) {
        showMessage(
          messageElement,
          "Please enter your mobile number with the country code. Example: +27821234567",
          true
        );
        return;
      }

      if (password.length < 6) {
        showMessage(
          messageElement,
          "Password must be at least 6 characters long.",
          true
        );
        return;
      }

      registerButton.disabled = true;
      registerButton.textContent = "Creating Account...";

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            phoneNumber: phoneNumber,
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showMessage(
            messageElement,
            data.message || "Unable to create account.",
            true
          );
          return;
        }

        showMessage(
          messageElement,
          "Account created successfully. Redirecting to login...",
          false
        );

        setTimeout(function () {
          window.location.href = "/login.html";
        }, 1200);
      } catch (error) {
        console.error("Registration error:", error);

        showMessage(
          messageElement,
          "Unable to connect to the server. Please try again.",
          true
        );
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
      }
    });
  }

  /*
   * LOGIN
   * Logs in using:
   * - Phone number
   * - Password
   */
  if (loginButton) {
    loginButton.addEventListener("click", async function () {
      const phoneElement = document.getElementById("phoneNumber");
      const passwordElement = document.getElementById("password");
      const messageElement = document.getElementById("message");

      const phoneNumber = phoneElement
        ? phoneElement.value.trim()
        : "";

      const password = passwordElement
        ? passwordElement.value
        : "";

      if (!phoneNumber || !password) {
        showMessage(
          messageElement,
          "Please enter your mobile number and password.",
          true
        );
        return;
      }

      if (!phoneNumber.startsWith("+")) {
        showMessage(
          messageElement,
          "Please enter your mobile number with the country code. Example: +27821234567",
          true
        );
        return;
      }

      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            password: password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showMessage(
            messageElement,
            data.message || "Login failed.",
            true
          );
          return;
        }

        localStorage.setItem(
          "madiAlertToken",
          data.token
        );

        localStorage.setItem(
          "madiAlertUser",
          JSON.stringify(data.user)
        );

        showMessage(
          messageElement,
          "Login successful. Redirecting...",
          false
        );

        setTimeout(function () {
          window.location.href = "/";
        }, 800);
      } catch (error) {
        console.error("Login error:", error);

        showMessage(
          messageElement,
          "Unable to connect to the server. Please try again.",
          true
        );
      } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
      }
    });
  }

  /*
   * LOGOUT
   */
  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      const token =
        localStorage.getItem("madiAlertToken");

      try {
        if (token) {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token
            }
          });
        }
      } catch (error) {
        console.error("Logout request error:", error);
      }

      localStorage.removeItem("madiAlertToken");
      localStorage.removeItem("madiAlertUser");

      window.location.href = "/login.html";
    });
  }
});


/*
 * DISPLAY MESSAGE
 */
function showMessage(element, message, isError) {
  if (!element) {
    alert(message);
    return;
  }

  element.textContent = message;

  if (isError) {
    element.style.color = "red";
  } else {
    element.style.color = "green";
  }
}


/*
 * GET STORED LOGIN TOKEN
 *
 * Other pages can use this function when
 * making requests to protected API routes.
 */
function getAuthToken() {
  return localStorage.getItem("madiAlertToken");
}


/*
 * GET STORED USER
 */
function getLoggedInUser() {
  const user = localStorage.getItem("madiAlertUser");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
}