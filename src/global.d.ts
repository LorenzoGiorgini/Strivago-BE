import UserModel from "./model/users";

declare global {
    namespace Express {
        interface Request {
            user?: UserModel;
        }
    }
}