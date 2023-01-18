import { NextFunction, Router, Request, Response } from "express";
import { admins } from "../data/admin";

export const router = Router();

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // fai il conntrollo del token
  if (false) {
    res.status(401).json({ message: "Unothorazied" });
  } else {
    next();
  }
};

router.post("/login", (req, res) => {});
