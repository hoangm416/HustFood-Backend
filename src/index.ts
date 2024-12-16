import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoutes";
import orderRoute from "./routes/OrderRoute";
// import path from "path";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

const app = express();

// // Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Redirect all routes to index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.use(cors());

app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" })); 

app.use(express.json());

app.get("/health", async (req: Request, res: Response)=>{
  res.send({message: "health OK!"});
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant",restaurantRoute);
app.use("/api/order", orderRoute);

app.listen(5000, () => {
  console.log("Server is starting on port 5000");
});
