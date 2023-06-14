import fetch from "node-fetch";
import { config } from "dotenv";
import { TApod } from "../types";

config();

const baseUrl =
  "https://api.nasa.gov/planetary/apod?api_key=" + process.env.API_KEY;

export const fetchApod = async () => {
  const apod = await fetch(baseUrl)
    .then((res) => res.json())
    .catch((err) => console.log("err", err));

  try {
    return apod as TApod;
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchRandomApod = async () => {
  const randomApodUrl = `${baseUrl}&count=1`;
  const apod = await fetch(randomApodUrl).then((res) => res.json());

  try {
    return apod as TApod[];
  } catch (error) {
    console.log("error", error);
  }
};

export const fetchDateApod = async (date: string) => {
  const randomApodUrl = `${baseUrl}&date=${date}`;
  const apod = await fetch(randomApodUrl).then((res) => res.json());

  try {
    return apod as TApod;
  } catch (error) {
    console.log("error", error);
  }
};
