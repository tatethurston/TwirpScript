import { createTwirpServerless } from "twirpscript";
import { habderdasherHandler } from "./habderdasher";
import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

const app = createTwirpServerless([habderdasherHandler]);

const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event,
) => {
  const res = await app({
    body: Buffer.from(event.body!),
    headers: event.headers,
    method: event.httpMethod,
    url: event.path,
  });

  // Binary responses must be base64 encoded for the AWS API Gateway / LambdaProxy integration
  if (res.headers["content-type"] === "application/protobuf") {
    res.body = Buffer.from(res.body).toString("base64");
    (res as APIGatewayProxyResult).isBase64Encoded = true;
  }

  return res as APIGatewayProxyResult;
};

export default handler;
