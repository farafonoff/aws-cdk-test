import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
const dbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const itemId = event.pathParameters?.id;
  //return { statusCode: 200, body: JSON.stringify(event) };
  if (!itemId) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the path parameter id",
    };
  }
  const getOneParams = {
    TableName: process.env.TABLE_NAME || "",
    Key: {
      [process.env.PRIMARY_KEY || ""]: itemId,
    },
  };
  try {
    const result = await documentClient.send(new GetCommand(getOneParams));
    return { statusCode: 200, body: JSON.stringify(result.Item) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export default handler;
