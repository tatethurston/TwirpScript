import {
  Authentication,
  AuthenticationHandler,
} from "../../services/authentication.pb";
import { login } from "../models";

export const AuthenticationService: Authentication = {
  Login: (credentials) => {
    const user = login(credentials);
    if (!user) {
      throw {
        code: "invalid_argument",
        msg: "Invalid username or password",
      };
    }
    return user;
  },
};

export const AuthenticationServiceHandler = AuthenticationHandler(
  AuthenticationService
);
