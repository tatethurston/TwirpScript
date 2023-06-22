import {
  Authentication,
  createAuthentication,
  CurrentUser,
  Credentials,
} from "../../../protos/authentication.pb";
import { randomBytes } from "crypto";
import { TwirpError } from "twirpscript";

const users = [
  { username: "example", password: "1234" },
  { username: "👋", password: "1234" },
];

const sessions: CurrentUser[] = [];

function login(credentials: Credentials): CurrentUser | undefined {
  const user = users.find(
    (u) =>
      u.username === credentials.username &&
      u.password === credentials.password,
  );

  if (user) {
    const token = randomBytes(20).toString("base64");
    const session = { username: user.username, token };
    sessions.push(session);
    return session;
  }
}

/**
 * Sentinal value for unauthenticated routes.
 */
export const unauthenticatedUser: CurrentUser = {
  username: "",
  token: "",
};

export function getCurrentUser(
  token: string | undefined,
): CurrentUser | undefined {
  if (!token) {
    return;
  }
  return sessions.find((s) => s.token === token);
}

export const authentication: Authentication = {
  Login: (credentials) => {
    const user = login(credentials);
    if (!user) {
      throw new TwirpError({
        code: "invalid_argument",
        msg: "Invalid username or password",
      });
    }
    return user;
  },
};

export const authenticationHandler = createAuthentication(authentication);
