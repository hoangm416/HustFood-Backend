import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";

const router = express.Router();

router.get(
    "/search/:city",
    param("city")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Tên phường phải là một chuỗi ký tự"),
    RestaurantController.searchRestaurant
  );

  router.get(
    "/:restaurantId",
    param("restaurantId")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Tên quán ăn phải là một chuỗi ký tự"),
    RestaurantController.getRestaurant
  );

export default router;