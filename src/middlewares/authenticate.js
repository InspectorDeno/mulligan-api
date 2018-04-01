import jwt from "jsonwebtoken";
import User from "../models/User";

/* Checks for authentication. If the user is not authenticated 
 we halt the operation and respond with an error message */

export default (req, res, next) => {
  const header = req.headers.authorization;
  let token;

  // "Bearer j23r8KfkEJ%S#ds8jf2..."
  if (header) {
    token = header.split(" ")[1];
  }
  if (token) {
    // Verify
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ errors: { global: "Invalid token" } });
      } else {
        User.findOne({ email: decoded.email }).then(user => {
          req.currentUser = user;
          // Call the next function if the token is valid
          next();
        });
      }
    });
  } else {
    res.status(401).json({ errors: { global: "No token" } });
  }
};
