import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: `${JSON.stringify(event)}`,
  };
};

export default handler;
