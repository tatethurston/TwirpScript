import { FC, useState } from "react";
import { render } from "react-dom";
import { MakeHat, Hat, Size } from "../services/haberdasher.pb";

function formatHat(hat: Hat): string {
  return `${hat.color} ${hat.name}, ${hat.inches} inches`;
}

const App: FC = () => {
  const [size, setSize] = useState<Size>();
  const [hats, setHats] = useState<Hat[]>([]);

  async function makeHat() {
    if (size) {
      const hat = await MakeHat("http://localhost:8080", size);
      setHats((hats) => [...hats, hat]);
    }
  }

  return (
    <div>
      <h1>Haberdasher Service</h1>
      <h3>Hats: </h3>
      <ul>
        {hats.map((hat) => (
          <li>{formatHat(hat)}</li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          makeHat();
          e.preventDefault();
        }}
      >
        <input
          type="number"
          onChange={(e) => setSize({ inches: parseInt(e.target.value) })}
        />
        <button type="submit" disabled={!size}>
          Make Hat!
        </button>
      </form>
    </div>
  );
};

render(<App />, document.getElementById("app"));
