import { Router } from "express";
import { getLastWinners, getPrices, searchWinners } from "../controllers/get.controller.js";




const getRoutes= Router();

getRoutes.get("/prices", getPrices);
getRoutes.get("/winners", getLastWinners);
getRoutes.get("/searchwinners", searchWinners);
getRoutes.get("/", (req, res) => {
  res.send("Welcome to the API");
});

export default getRoutes;