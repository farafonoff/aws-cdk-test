import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

const sqsClient = new SQSClient({});
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
  const sendCommand = new SendMessageCommand({
    QueueUrl: process.env.QUEUE_ENDPOINT || "",
    MessageBody: JSON.stringify({
      key: editedItemId,
      operation: "PUT",
      body: JSON.parse(event.body),
    }),
  });
  try {
    const result = await sqsClient.send(sendCommand);
    return { statusCode: 200, body: JSON.stringify(result.MessageId) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export default handler;
