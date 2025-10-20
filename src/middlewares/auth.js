import jwt from "jsonwebtoken";
import pkg from "helper-utils-library";
const { Unauthorized, failureResponse } = pkg;

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return failureResponse(res, new Unauthorized("No token provided."), 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return failureResponse(res, new Unauthorized("Invalid or expired token."), 401);
    }
}

export default authMiddleware;
