import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  saveVerificationCode,
  getVerificationCode,
  removeVerificationCode
} from "./verificationStore.js";


/*
|--------------------------------------------------------------------------
| CREATE ACCOUNT
|--------------------------------------------------------------------------
*/

export const registerUser = async (
  req,
  res
) => {

  try {

    const {
      name,
      phoneNumber
    } = req.body;


    if (!name || !phoneNumber) {

      return res.status(400).json({
        success: false,
        message:
          "Name and phone number are required"
      });

    }


    const existingUser =
      await User.findOne({
        phoneNumber
      });


    if (existingUser) {

      return res.status(400).json({
        success: false,
        message:
          "An account with this phone number already exists"
      });

    }


    const user =
      await User.create({
        name,
        phoneNumber
      });


    return res.status(201).json({

      success: true,

      message:
        "Account created successfully",

      user: {
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
        "Unable to create account"

    });

  }

};


/*
|--------------------------------------------------------------------------
| SEND VERIFICATION CODE
|--------------------------------------------------------------------------
*/

export const sendVerificationCode =
  async (
    req,
    res
  ) => {

    try {

      const {
        phoneNumber
      } = req.body;


      if (!phoneNumber) {

        return res.status(400).json({

          success: false,

          message:
            "Phone number is required"

        });

      }


      const user =
        await User.findOne({
          phoneNumber
        });


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "Account not found. Please create an account first."

        });

      }


      const verificationCode =
        Math.floor(
          100000 +
          Math.random() *
          900000
        ).toString();


      saveVerificationCode(
        phoneNumber,
        verificationCode
      );


      console.log(
        `Madi Alert verification code for ${phoneNumber}: ${verificationCode}`
      );


      return res.status(200).json({

        success: true,

        message:
          "Verification code sent successfully",

        // DEVELOPMENT ONLY
        verificationCode

      });


    } catch (error) {

      console.error(
        "Send code error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Unable to send verification code"

      });

    }

  };


/*
|--------------------------------------------------------------------------
| VERIFY CODE AND AUTHENTICATE USER
|--------------------------------------------------------------------------
*/

export const verifyCode =
  async (
    req,
    res
  ) => {

    try {

      const {
        phoneNumber,
        verificationCode
      } = req.body;


      if (
        !phoneNumber ||
        !verificationCode
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Phone number and verification code are required"

        });

      }


      const storedVerification =
        getVerificationCode(
          phoneNumber
        );


      if (!storedVerification) {

        return res.status(400).json({

          success: false,

          message:
            "Verification code not found"

        });

      }


      /*
      Check expiry
      */

      if (
        Date.now() >
        storedVerification.expiresAt
      ) {

        removeVerificationCode(
          phoneNumber
        );


        return res.status(400).json({

          success: false,

          message:
            "Verification code has expired"

        });

      }


      /*
      Check verification code
      */

      if (
        storedVerification.code !==
        verificationCode
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid verification code"

        });

      }


      const user =
        await User.findOne({
          phoneNumber
        });


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User account not found"

        });

      }


      /*
      Mark account verified
      */

      user.isVerified = true;

      await user.save();


      /*
      Remove used code
      */

      removeVerificationCode(
        phoneNumber
      );


      /*
      Create authentication token
      */

      const token =
        jwt.sign(

          {

            userId:
              user._id,

            phoneNumber:
              user.phoneNumber

          },

          process.env.JWT_SECRET ||
          "development-secret",

          {

            expiresIn: "7d"

          }

        );


      return res.status(200).json({

        success: true,

        message:
          "Authentication successful",

        token,

        user: {

          name:
            user.name,

          phoneNumber:
            user.phoneNumber

        }

      });


    } catch (error) {

      console.error(
        "Verification error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Authentication failed"

      });

    }

  };