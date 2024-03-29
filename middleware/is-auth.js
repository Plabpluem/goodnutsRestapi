const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authentication for authHeader");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, "supertokensecretgoodnuts");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodeToken) {
    const error = new Error("Not authentication at token");
    error.statusCode = 401;
    throw error;
  }
  console.log(decodeToken)
  req.userId = decodeToken.userId;
  next();
};
