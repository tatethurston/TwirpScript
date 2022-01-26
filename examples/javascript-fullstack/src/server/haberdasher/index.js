import { createHaberdasherHandler } from "../../protos/haberdasher.pb.js";

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export const Haberdasher = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: choose(["red", "green", "blue", "purple"]),
      name: choose(["beanie", "fedora", "top hat", "cowboy", "beret"]),
    };
  },
};

export const HaberdasherHandler = createHaberdasherHandler(Haberdasher);
