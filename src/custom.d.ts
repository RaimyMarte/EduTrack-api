import { UserInstance, UserTokenInstance } from "./models/authentication";

export { };

declare global {
  namespace Express {
    export interface Request {
      user: UserInstance | null;
      userToken: UserTokenInstance | null;
    }
  }
}