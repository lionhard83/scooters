import { NextFunction, Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { admins } from "../data/admin";
const secret = "shhhhhh";

export const router = Router();

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "unauthorization" });
  } else {
    try {
      jwt.verify(token, secret);
      return next();
    } catch (err) {
      return res.status(401).json({ message: "unauthorization" });
    }
  }
};

router.get("/onlyAdmin", isAdmin, (req, res) => {
  res.json({ message: "you are admin!" });
});

router.post(
  "/login",
  body("email").trim().isEmail(),
  body("password").trim().exists(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const admin = admins.find(
      (admin) => admin.email === email && admin.password === password
    );
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(admin, secret);
    res.json({
      token,
      refreshToken: "",
      expiredIn: 982, // iat
    });
  }
);
