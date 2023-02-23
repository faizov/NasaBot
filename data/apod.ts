import fetch from "node-fetch";
import { config } from "dotenv";
import { TApod } from "../types";

config();

const apodUrl =
  "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

export const fetchApod = async () => {
  const apod = await fetch(apodUrl).then((res) => res.json());
  try {
    return apod as TApod;
  } catch (error) {
    console.log("eroor", error);
  }
};

export const fetchRandomApod = async () => {
  const randomApodUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}&count=1`;
  const apod = await fetch(randomApodUrl).then((res) => res.json());

  try {
    return apod as TApod[];
  } catch (error) {
    console.log("eroor", error);
  }
};
