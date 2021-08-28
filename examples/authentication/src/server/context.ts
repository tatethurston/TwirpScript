import { CurrentUser } from "../services/authentication.pb";

export interface Context {
  currentUser: CurrentUser;
}
