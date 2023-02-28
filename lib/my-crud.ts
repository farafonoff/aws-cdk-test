import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class MyCrudConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const TABLE_NAME = "items";
    const PRIMARY_KEY = "id";

    const dynamoTable = new Table(this, "items", {
      partitionKey: {
        name: PRIMARY_KEY,
        type: AttributeType.STRING,
      },
      tableName: TABLE_NAME,

      /**
       *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      //depsLockFilePath: join(__dirname, "lambdas", "package-lock.json"),
      environment: {
        PRIMARY_KEY: PRIMARY_KEY,
        TABLE_NAME: dynamoTable.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
    };

    const HelloLambda = new NodejsFunction(this, "hello", {
      entry: join(__dirname, "..", "lambdas", "hello.ts"),
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, "getAll", {
      entry: join(__dirname, "..", "lambdas", "getAll.ts"),
      ...nodeJsFunctionProps,
    });
    const putLambda = new NodejsFunction(this, "put", {
      entry: join(__dirname, "..", "lambdas", "put.ts"),
      ...nodeJsFunctionProps,
    });
    const getOneLambda = new NodejsFunction(this, "getOne", {
      entry: join(__dirname, "..", "lambdas", "getOne.ts"),
      ...nodeJsFunctionProps,
    });
    const helloIntegration = new LambdaIntegration(HelloLambda);
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const putIntegration = new LambdaIntegration(putLambda);

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, "itemsApi", {
      restApiName: "Items Service",
    });

    const hello = api.root.addResource("hello");
    hello.addMethod("GET", helloIntegration);

    const items = api.root.addResource("items");
    items.addMethod("GET", getAllIntegration);
    const putEndpoint = items.addResource("{id}");
    putEndpoint.addMethod("PUT", putIntegration);
    putEndpoint.addMethod("GET", getOneIntegration);
    const dbAccessingLambdas = [getAllLambda, getOneLambda, putLambda];
    dbAccessingLambdas.forEach((lambda) => {
      lambda.addToRolePolicy(
        new PolicyStatement({
          actions: ["dynamodb:*"],
          resources: [dynamoTable.tableArn],
        })
      );
    });
  }
}