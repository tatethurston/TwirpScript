import {
  AuthenticationService,
  createAuthenticationHandler,
  CurrentUser,
  Credentials,
} from "../../../protos/authentication.pb";
import { randomBytes } from "crypto";

const users = [{ username: "example", password: "1234" }];

const sessions: CurrentUser[] = [];

function login(credentials: Credentials): CurrentUser | undefined {
  const user = users.find(
    (u) =>
      u.username === credentials.username && u.password === credentials.password
  );

  if (user) {
    const token = randomBytes(20).toString("base64");
    const session = { username: user.username, token };
    sessions.push(session);
    return session;
  }
}

export function getCurrentUser(
  token: string | undefined
): CurrentUser | undefined {
  if (!token) {
    return;
  }
  return sessions.find((s) => s.token === token);
}

export const Authentication: AuthenticationService = {
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

export const AuthenticationHandler =
  createAuthenticationHandler(Authentication);
