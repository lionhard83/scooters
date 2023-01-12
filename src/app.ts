import express from "express";
import { router as scooterApi } from "./routes/scooters";
import { router as booksApi } from "./routes/books";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/scooters", scooterApi);
app.use("/books", booksApi);

app.listen(3000, () => console.log("Server is running"));
