import express from "express";
import { scooters } from "./data/scooters";
import { books } from "./data/books";
import { Scooter } from "./models/Scooter";

const app = express();

function getDistance(x1: number, y1: number, x2: number, y2: number) {
  let y = x2 - x1;
  let x = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

app.get("/scooters", (req, res) => {
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
    const result = scts
      .filter(({ distance }) => distance! < Number(maxDistance))
      .sort((a, b) => (a.distance! > b.distance! ? 1 : -1));
    return res.json(result);
  }
  res.json(scts);
});

app.patch("/scooters/:id", (req, res) => {
  const lock = req.body.lock;
  const scooterId = req.params.id;
});

app.listen(3000, () => console.log("Server is running"));
