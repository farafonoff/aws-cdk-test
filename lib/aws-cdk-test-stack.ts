import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { MyCrudConstruct } from "./my-crud";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const instance = new MyCrudConstruct(this, "crud-app");
  }
}
