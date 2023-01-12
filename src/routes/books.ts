import { Router } from "express";
import { books } from "../data/books";

export const router = Router();

router.get("/", (_, res) => {
  res.json(books);
});
