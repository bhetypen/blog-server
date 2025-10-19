const jwt = require("jsonwebtoken");
const secret = "blogPostAPI";


module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
    };
    return jwt.sign(data, secret);
};

module.exports.verify = (req, res, next) => {
    const hdr = req.headers.authorization;
    if (!hdr) return res.status(401).send({ auth: "Failed", message: "No token provided" });

    // Accept both "Bearer <token>" and raw token
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : hdr;

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).send({ auth: "Failed", message: err.message });
        req.user = decoded;
        return next();
    });
};

module.exports.verifyAdmin = (req, res, next) => {
    if (req.user?.isAdmin) return next();
    return res.status(403).send({ auth: "Failed", message: "Action Forbidden" });
};

module.exports.errorHandler = (err, req, res, next) => {
  console.error(err); // log for debugging
  res.status(err.status || 500).json({
    auth: "Failed",
    message: err.message || "Server Error"
  });
};



