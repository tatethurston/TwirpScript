import { Context } from "../../context";
import {
  HaberdasherService,
  createHaberdasherHandler,
} from "../../../protos/haberdasher.pb";

function choose<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export const Haberdasher: HaberdasherService<Context> = {
  MakeHat: (size, ctx) => {
    const username = ctx.currentUser.username;
    const hat = choose(["beanie", "fedora", "top hat", "cowboy", "beret"]);
    const name = `${username}'s ${hat}`;

    return {
      inches: size.inches,
      color: choose(["red", "green", "blue", "purple"]),
      name,
    };
  },
};

export const HaberdasherHandler = createHaberdasherHandler(Haberdasher);
