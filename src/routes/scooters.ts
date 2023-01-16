import { Router } from "express";
import { scooters } from "../data/scooters";
import { Scooter } from "../models/Scooter";
import { Book } from "../models/Book";
import { books } from "../data/books";
import { v4 as uuidv4 } from "uuid";
import { body, query, validationResult } from "express-validator";

export const router = Router();

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  let y = x2 - x1;
  let x = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

const checkLat = (where: typeof body) => {
  return where("lat")
    .notEmpty()
    .toFloat()
    .custom((value) => {
      if (isFinite(value) && Math.abs(value) <= 90) {
        return true;
      } else throw new Error("Lat is not valid value");
    });
};
const checkLong = (where: typeof body) => {
  return where("long")
    .notEmpty()
    .toFloat()
    .custom((value) => {
      if (isFinite(value) && Math.abs(value) <= 180) {
        return true;
      } else throw new Error("Long is not valid value");
    });
};

router.get(
  "/",
  checkLat(query),
  checkLong(query),
  query("maxDistance").notEmpty().toInt(),
  (req, res) => {
    let scts: (Scooter & { distance?: number })[] = [...scooters];
    const { lat, long, maxDistance } = req.query as Record<
      "lat" | "long" | "maxDistance",
      number
    >;
    if (lat && long && maxDistance) {
      scts = scts.map((scooter) => {
        return {
          ...scooter,
          distance: getDistance(scooter.lat, scooter.long, lat, long),
        };
      });
      const result: (Scooter & { distance?: number })[] = scts
        .filter(({ distance }) => distance! < maxDistance)
        .sort((a, b) => (a.distance! > b.distance! ? 1 : -1));
      return res.json(result);
    }
    res.json(scts);
  }
);

router.patch("/:id", (req, res) => {
  const unlock = req.body.unlock; // sblocca
  const scooterId = req.params.id as string;
  const scooter = scooters.find(
    (scooter) => String(scooter.id) === String(scooterId)
  );
  if (!scooter) {
    return res.status(404).json({ message: "Scooter not found" });
  }
  if (unlock) {
    const id = uuidv4();
    scooter.bookId = id;
    const book: Book = {
      id,
      scooterId,
      startLat: scooter.lat,
      startLong: scooter.long,
      startDate: Date.now(),
    };
    books.push(book);
    return res.json(scooter);
  } else if (!unlock) {
    const book = books.find((book) => book.id === scooter.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    book.endDate = Date.now();
    book.endLat = req.body.lat;
    book.endLong = req.body.long;
    book.pay = (book.endDate - book.startDate) * 200;
    book.distance = getDistance(
      Number(book.endLat),
      Number(book.endLong),
      book.startLat,
      book.startLong
    );
    delete scooter.bookId;
    return res.json({
      scooter,
      book,
    });
  }
});

router.post("/", checkLat(body), checkLong(body), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const scooter: Scooter = {
    id: uuidv4(),
    lat: req.body.lat,
    long: req.body.long,
  };
  scooters.push(scooter);
  res.json(scooter);
});
