import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateMyUserRequest = [
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Họ tên phải là một chuỗi ký tự"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("Địa chỉ phải là một chuỗi ký tự"),
  body("phone")
    .isNumeric()
    .notEmpty()
    .withMessage("Số điện thoại phải là một chuỗi số"),
  body("idCard")
    .isNumeric()
    .notEmpty()
    .withMessage("Số CCCD phải là một chuỗi số"),
  handleValidationErrors,
];

export const validateMyRestaurantRequest = [
  body("restaurantName").notEmpty().withMessage("Tên nhà hàng là bắt buộc"),
  body("city").notEmpty().withMessage("Tên phường là bắt buộc"),
  body("country").notEmpty().withMessage("Tên quận là bắt buộc"),
  body("deliveryPrice")
    .isInt({ min: 0 })
    .withMessage("Giá giao hàng phải là một số dương"),
  body("estimatedDeliveryTime")
    .isInt({ min: 0 })
    .withMessage("Thời gian giao hàng ước tính phải là một số dương"),
  body("cuisines")
    .isArray()
    .withMessage("Danh sách món ăn phải là một mảng")
    .not()
    .isEmpty()
    .withMessage("Danh sách món ăn không được để trống"),
  body("menuItems").isArray().withMessage("Thực đơn phải là một mảng"),
  body("menuItems.*.name")
    .notEmpty()
    .withMessage("Tên món ăn không được để trống"),
  body("menuItems.*.price")
    .isInt({ min: 0 })
    .withMessage(
      "Đơn giá các món ăn phải là một số dương"
    ),
  handleValidationErrors,
];
