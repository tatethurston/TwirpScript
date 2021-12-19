import { createTwirpServerless } from "twirpscript";
import { HaberdasherHandler } from "./habderdasher";
import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";

const app = createTwirpServerless([HaberdasherHandler]);

const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event
) => {
  const res = await app({
    body: event.body,
    headers: event.headers,
    method: event.httpMethod,
    url: event.path,
  });

  // Binary responses must be base64 encoded for the AWS API Gateway / LambdaProxy integration
  if (res.headers["Content-Type"] === "application/protobuf") {
    res.body = res.body.toString("base64");
    (res as APIGatewayProxyResult).isBase64Encoded = true;
  }

  return res as APIGatewayProxyResult;
};

export default handler;
