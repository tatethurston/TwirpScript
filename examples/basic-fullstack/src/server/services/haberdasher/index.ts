import {
  HaberdasherService,
  createHaberdasherHandler,
} from "../../../protos/haberdasher.pb";

function choose<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export const Haberdasher: HaberdasherService = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: choose(["red", "green", "blue", "purple"]),
      name: choose(["beanie", "fedora", "top hat", "cowboy", "beret"]),
    };
  },
};

export const HaberdasherHandler = createHaberdasherHandler(Haberdasher);
