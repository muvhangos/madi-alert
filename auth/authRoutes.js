import express from "express";


import {

  registerUser,

  sendVerificationCode,

  verifyCode

} from "../auth/authController.js";


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| Create Account
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  registerUser
);


/*
|--------------------------------------------------------------------------
| Send Verification Code
|--------------------------------------------------------------------------
*/

router.post(
  "/send-code",
  sendVerificationCode
);


/*
|--------------------------------------------------------------------------
| Verify Code and Login
|--------------------------------------------------------------------------
*/

router.post(
  "/verify-code",
  verifyCode
);


export default router;