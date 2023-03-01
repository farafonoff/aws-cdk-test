import { Context, SQSEvent } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
const dbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dbClient);

exports.handler = async (event: SQSEvent, _context: Context) => {
  const tableName = process.env.TABLE_NAME || "";
  const keyProperty = process.env.PRIMARY_KEY || "";
  const putRequests = event.Records.map((record) => {
    const parsedBody = JSON.parse(record.body);
    const key = parsedBody.key;
    const restOfObject = parsedBody.body;
    const writeItem = {
      ...restOfObject,
      [keyProperty]: key,
    };
    return {
      PutRequest: {
        Item: writeItem,
      },
    };
  });
  const batchWrite: BatchWriteCommandInput = {
    RequestItems: {
      [tableName]: putRequests,
    },
  };
  const result = await documentClient.send(new BatchWriteCommand(batchWrite));
  const unprocessedNumber = result.UnprocessedItems?.[tableName]?.length || 0;
  if (unprocessedNumber > 0) {
    throw new Error(
      `Some messages wasn't processed ${unprocessedNumber} ${result.UnprocessedItems}`
    );
  }
};
