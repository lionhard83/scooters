import { NextFunction, Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { admins } from "../data/admin";
import { v4 } from "uuid";
import { User } from "../models/User";

const secret = "shhhhhh";

export const router = Router();

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "unauthorization" });
  } else {
    try {
      const { name, surname, email } = jwt.verify(token, secret) as User;
      res.locals = { name, surname, email };
      return next();
    } catch (err) {
      return res.status(401).json({ message: "unauthorization" });
    }
  }
};

router.get("/onlyAdmin", isAdmin, (req, res) => {
  console.log(res.locals);
  res.json({ message: "you are admin!" });
});

router.get("/me", isAdmin, (_, res) => {
  res.json(res.locals);
});

router.get("/verify/:uuid", param("uuid").isUUID(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const uuid = req.params!.uuid;
  const admin = admins.find((admin) => admin.uuid === uuid);
  if (!admin) {
    return res.status(401).json({ message: "Invalid link" });
  }
  delete admin.uuid;
  const token = jwt.sign(admin, secret);
  res.json({
    token,
    refreshToken: "",
    expiredIn: 982, // iat
  });
});

router.post(
  "/signup",
  body("name").trim(),
  body("surname").trim(),
  body("email").trim().isEmail(),
  body("password").trim().exists(),
  body("email").custom((value) => {
    const admin = admins.find((admin) => admin.email === value);
    if (admin) {
      throw new Error("Email already used");
    }
    return true;
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const { email, password, name, surname } = req.body;
    admins.push({ name, surname, email, password, uuid: v4() });
    res.status(201).json({ message: "User has been created!" });
  }
);

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
    if (admin.uuid) {
      return res.status(401).json({ message: "Email is not confirmed" });
    }
    const token = jwt.sign(admin, secret);
    res.json({
      token,
      refreshToken: "",
      expiredIn: 982, // iat
    });
  }
);
