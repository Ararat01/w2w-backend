import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;
      next();
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: "No access 1",
      });
    }
  } else {
    return res.status(403).json({
      message: "No access 2",
    });
  }
};
