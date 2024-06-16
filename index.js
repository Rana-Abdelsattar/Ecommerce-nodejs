import express from "express";
import initiate from "./src/index.route.js";

import { config } from "dotenv";

config({path:'./config/dev.env'})


const app=express();

initiate(app,express)
