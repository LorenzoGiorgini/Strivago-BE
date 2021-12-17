import {Request, Response, NextFunction } from 'express';

export const RoleCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role === "host") {
        next();
    } else {
        res.status(401).send({ success: false, message: "You are not authorized" });
    }
}