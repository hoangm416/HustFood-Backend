import axios from "axios";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import crypto from "crypto";

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE as string;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY as string;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY as string;
const MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const BACKEND_URL = process.env.BACKEND_URL as string;

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    res.status(500).json({ message: "Xảy ra lỗi khi lấy dữ liệu đơn hàng" });
  }
};

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    phone: string;
  };
  restaurantId: string;
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: "Không thấy quán ăn" });
      return;
    }

    const totalAmount = calculateTotalAmount(
      checkoutSessionRequest,
      restaurant.menuItems,
      restaurant.deliveryPrice
    );

    const newOrder = new Order({
      restaurant: restaurant._id,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const paymentData = createMomoPaymentData(newOrder._id.toString(), totalAmount);
    const momoResponse = await axios.post(MOMO_ENDPOINT, paymentData);

    if (momoResponse.data.resultCode !== 0) {
      console.error("Lỗi MoMo API:", momoResponse.data);
      res.status(400).json({ message: "Lỗi tạo phiên thanh toán MoMo" });
      return;
    }

    await newOrder.save();
    res.json({ url: momoResponse.data.payUrl });
  } catch (error: any) {
    console.error("Lỗi tạo phiên thanh toán:", error);
    res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
  }
};

const calculateTotalAmount = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[],
  deliveryPrice: number
): number => {
  try {
    const itemsTotal = checkoutSessionRequest.cartItems.reduce((total, cartItem) => {
      const menuItem = menuItems.find(
        (item) => item._id.toString() === cartItem.menuItemId.toString()
      );

      if (!menuItem) {
        throw new Error(`Không thấy món ăn: ${cartItem.menuItemId}`);
      }

      return total + menuItem.price * parseInt(cartItem.quantity, 10);
    }, 0);

    return itemsTotal + deliveryPrice;
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    throw error;
  }
};

const createMomoPaymentData = (orderId: string, amount: number) => {
  const requestId = `${orderId}-${Date.now()}`;
  const orderInfo = `Payment for order ${orderId}`;
  const redirectUrl = `${FRONTEND_URL}/order-status`;
  const ipnUrl = `${BACKEND_URL}/api/order/checkout/webhook`;

  const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  const signature = generateSignature(rawSignature, MOMO_SECRET_KEY);

  return {
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType: "captureWallet",
    extraData: "",
    signature,
  };
};

const generateSignature = (rawSignature: string, secretKey: string): string => {
  return crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
};

const momoWebhookHandler = async (req: Request, res: Response) => {
  try {
    // Parse raw body thành JSON nếu chưa parse
    const rawBody = req.body.toString("utf-8");
    const data = JSON.parse(rawBody);

    const { orderId, resultCode } = data;

    if (!orderId) {
      res.status(400).json({ message: "Thiếu orderId trong dữ liệu webhook" });
      return;
    }

    if (resultCode === 0) {
      console.log(`Đơn hàng ${orderId} thanh toán thành công.`);
      res.status(200).send("Webhook xử lý thành công.");
    } else {
      console.log(`Đơn hàng ${orderId} thanh toán thất bại.`);
      res.status(200).send("Webhook xử lý thất bại.");
    }
  } 
  catch (error) {
    console.error("Lỗi xử lý webhook:", error);
    res.status(500).json({ message: "Lỗi xử lý webhook" });
  }
};

export default {
  getMyOrders,
  createCheckoutSession,
  momoWebhookHandler,
};
