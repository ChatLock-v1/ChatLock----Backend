import jwt from "jsonwebtoken"
import dotenc from "dotenv";
dotenc.config()

export const isAuth = async (req, res, next) => {
  const token = req.cookies.token


  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded =jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed or expired' });
  }
};


