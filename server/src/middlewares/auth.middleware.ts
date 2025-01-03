import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { User } from "@/models/user.model";
import { BlackListToken } from "@/models/black-list-token.model";
import { Captain } from "@/models/captain.model";

export const checkLogin = async (
  req: Request & { user?: any; captain?: any },
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token is blacklisted
    const isBlackListed = await BlackListToken.findOne({ token });

    if (isBlackListed) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;

    const user = await User.findById(decoded._id);

    if (user) {
      req.user = user;
      return next();
    }

    const captain = await Captain.findById(decoded._id);

    if (captain) {
      req.captain = captain;
      return next();
    }
  } catch (error) {
    next(error);
  }
};
