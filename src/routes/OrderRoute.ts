import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, OrderController.getMyOrders);

router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  OrderController.createCheckoutSession
);

router.post("/checkout/webhook", OrderController.momoWebhookHandler);

router.get("/order-status", (req, res) => {
  const { partnerCode, orderId, requestId } = req.query;

  // Thêm logic xử lý khi nhận kết quả thanh toán thành công từ MOMO
  res.status(200).send({
    message: "Thanh toán thành công!",
    partnerCode,
    orderId,
    requestId,
  });
});

export default router;