import { FC, useState } from "react";
import { render } from "react-dom";
import { TwirpError } from "twirpscript";
import { CurrentUser, Login } from "../services/authentication.pb";
import { MakeHat, Hat, Size } from "../services/haberdasher.pb";

const _fetch = window.fetch;
window.fetch = (resource, init) => {
  const headers = init?.headers ?? {};
  const auth = localStorage.getItem("auth");
  if (auth) {
    (headers as any)["authorization"] = `bearer ${auth}`;
  }

  return _fetch(resource, { ...init, headers });
};

function formatHat(hat: Hat): string {
  return `${hat.color} ${hat.name}, ${hat.inches} inches`;
}

const App: FC = () => {
  const [size, setSize] = useState<Size>();
  const [hats, setHats] = useState<Hat[]>([]);
  const [error, setError] = useState<TwirpError>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [user, setUser] = useState<CurrentUser>();

  async function login() {
    if (username && password) {
      try {
        setError(undefined);
        const currentUser = await Login("http://localhost:8080", {
          username,
          password,
        });
        setUser(currentUser);
        localStorage.setItem("auth", currentUser.token);
        setUsername(undefined);
        setPassword(undefined);
      } catch (e) {
        setError(e);
      }
    }
  }

  function logout() {
    setUser(undefined);
    localStorage.setItem("auth", "");
  }

  async function makeHat() {
    if (size) {
      try {
        setError(undefined);
        const hat = await MakeHat("http://localhost:8080", size);
        setHats((hats) => [...hats, hat]);
        setSize(undefined);
      } catch (e) {
        setError(e);
      }
    }
  }

  return (
    <div>
      <h1>Haberdasher Service</h1>
      <h3>Current User: </h3>
      {user ? (
        <div>
          <p>{user.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <form
            onSubmit={(e) => {
              login();
              e.preventDefault();
            }}
          >
            <label>
              Username
              <input
                type="string"
                placeholder="example"
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                placeholder="1234"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" disabled={!username || !password}>
              Login
            </button>
          </form>
        </div>
      )}
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
      <h3>Errors: </h3>
      {error ? (
        <div>
          <p>Code: {error.code}</p>
          <p>Message: {error.msg}</p>
        </div>
      ) : (
        <p>No Errors</p>
      )}
    </div>
  );
};

render(<App />, document.getElementById("app"));
