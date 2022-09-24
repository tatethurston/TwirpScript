// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createTwirpServer } from "twirpscript";
import haberdasherHandler from "../../src/haberdasherHandler";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const app = createTwirpServer([haberdasherHandler], { prefix: "/api" });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  app(req, res);
}
