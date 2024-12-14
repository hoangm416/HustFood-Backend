import { Request, Response } from "express";
import User from "../models/user";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }
    res.json(currentUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi",
    });
    return;
  }
};

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      res.status(200).send();
      return;
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi đăng ký hồ sơ" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, phone, idCard } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    user.name = name;
    user.addressLine1 = addressLine1;
    user.phone = phone;
    user.idCard = idCard;

    await user.save();

    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
  updateCurrentUser,
};
