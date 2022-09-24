import type { AppProps } from "next/app";
import { client } from "twirpscript";

client.baseURL = "http://localhost:3000";
client.prefix = "/api";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
