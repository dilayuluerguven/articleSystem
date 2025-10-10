const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token yok" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token yok" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET); 
    console.log("Decoded token:", decoded); 
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token geçersiz" });
  }
};

module.exports = authMiddleware;
