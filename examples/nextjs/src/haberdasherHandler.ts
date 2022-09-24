import { createHaberdasher, Hat } from "./haberdasher.pb";

const hats: Hat[] = [
  {
    inches: 12,
    color: "red",
    name: "fedora",
  },
];

function choose<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default createHaberdasher({
  GetAll: () => ({ hats }),
  MakeHat: (size) => {
    const hat = {
      inches: size.inches,
      color: choose(["red", "green", "blue", "purple"]),
      name: choose(["beanie", "fedora", "top hat", "cowboy", "beret"]),
    };
    hats.push(hat);
    return hat;
  },
});
