import express from "express";
import { router as scooterApi } from "./routes/scooters";
import { router as booksApi } from "./routes/books";
import { router as authApi } from "./routes/auth";
import bodyParser from "body-parser";

export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/status", (req, res) => {
  res.json({ message: "Server is runnning" });
});
app.use("/auth", authApi);
app.use("/scooters", scooterApi);
app.use("/books", booksApi);

app.listen(3000, () => console.log("Server is running"));
