import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
const dbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: process.env.TABLE_NAME || "",
  };
  try {
    const result = await documentClient.send(new ScanCommand(params));
    return { statusCode: 200, body: JSON.stringify(result.Items) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export default handler;
