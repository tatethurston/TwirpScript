import type { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import { Hat, GetAll, MakeHat, Size } from "../src/haberdasher.pb";

function formatHat(hat: Hat): string {
  return `${hat.color} ${hat.name}, ${hat.inches} inches`;
}

function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [size, setSize] = useState<Size>();
  const [hats, setHats] = useState<Hat[]>(props.hats);

  return (
    <div>
      <Head>
        <title>TwirpScript + Next.js</title>
      </Head>

      <main>
        <h1>TwirpScript</h1>

        <div>
          <h1>Haberdasher </h1>
          <h3>Hats: </h3>
          <ul>
            {hats.map((hat, idx) => (
              <li key={idx}>{formatHat(hat)}</li>
            ))}
          </ul>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (size) {
                const hat = await MakeHat(size);
                setHats((hats) => [...hats, hat]);
              }
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
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await GetAll({});
  return {
    props: res,
  };
}

export default Home;
