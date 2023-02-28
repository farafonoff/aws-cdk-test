import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
const dbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the parameter body",
    };
  }

  const editedItemId = event.pathParameters?.id;
  if (!editedItemId) {
    return {
      statusCode: 400,
      body: "invalid request, you are missing the path parameter id",
    };
  }
  const putParams = {
    TableName: process.env.TABLE_NAME || "",
    Item: {
      ...JSON.parse(event.body),
      [process.env.PRIMARY_KEY || ""]: editedItemId,
    },
  };
  try {
    const result = await documentClient.send(new PutCommand(putParams));
    return { statusCode: 200, body: JSON.stringify(putParams.Item) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export default handler;
