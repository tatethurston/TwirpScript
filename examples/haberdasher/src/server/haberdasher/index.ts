import { Haberdasher, HaberdasherHandler } from "./service.pb";

export const HaberdasherService: Haberdasher = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: "purple",
      name: "my first hat",
    };
  },
};

export const HaberdasherServiceHandler = HaberdasherHandler(HaberdasherService);
