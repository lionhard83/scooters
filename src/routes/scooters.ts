import { Router } from "express";
import { scooters } from "../data/scooters";
import { Scooter } from "../models/Scooter";
import { Book } from "../models/Book";
import { books } from "../data/books";
import { v4 as uuidv4 } from "uuid";

export const router = Router();

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  let y = x2 - x1;
  let x = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

router.get("/", (req, res) => {
  let scts: (Scooter & { distance?: number })[] = [...scooters];
  const { lat, long, maxDistance } = req.query;
  if (lat && long && maxDistance) {
    scts = scts.map((scooter) => {
      return {
        ...scooter,
        distance: getDistance(
          scooter.lat,
          scooter.long,
          Number(lat),
          Number(long)
        ),
      };
    });
    const result: (Scooter & { distance?: number })[] = scts
      .filter(({ distance }) => distance! < Number(maxDistance))
      .sort((a, b) => (a.distance! > b.distance! ? 1 : -1));
    return res.json(result);
  }
  res.json(scts);
});

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
