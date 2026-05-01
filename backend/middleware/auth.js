const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.header("Authorization");
  if(!token) return res.status(401).json({msg: "no token"});
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }
  try{
    const decoded =  jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports = auth;