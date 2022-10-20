import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
  ) {
  }

  async getTodosPerUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos for a particular user')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      ExpressionAttributeValues: {
        ':userId': userId
      },
      KeyConditionExpression: 'userId = :userId',
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }


  async getUniqueTodoPerUser(todoId: string): Promise<TodoItem> {
    logger.info('Getting a unique todo of a particular user')

    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      
      ExpressionAttributeValues: {
        ':todoId': todoId,
        // ':userId': userId
      },
      KeyConditionExpression: 'todoId = :todoId'
    }).promise()

    const item = result.Items
    if (item.length !== 0)
      return result.Items[0] as TodoItem

    return null
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating a todo');
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem;
  }


  async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
    logger.info('Updating a todo');
    const updated = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done,
        ':attachmentURL': todo.attachmentUrl
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',

    }).promise()

    logger.info(updated.Attributes);
    return updated.Attributes as TodoUpdate;
  }

  // async updateTodo(todo: TodoItem): Promise<TodoItem> {
  //   logger.info(`Updating a todo item: ${todo.todoId}`);
  //   const result = await this.docClient
  //     .update({
  //       TableName: this.todosTable,
  //       Key: { 
  //         userId: todo.userId,
  //         todoId: todo.todoId 
  //       },
  //       // ConditionExpression: 'attribute_exists(todoId)',
  //       UpdateExpression: 'set attachmentUrl = :attachmentUrl',
  //       ExpressionAttributeValues: {
  //         ":attachmentUrl" : todo.attachmentUrl
  //       }
  //     })
  //     .promise();
  //   return result.Attributes as TodoItem
  // }

  async deleteTodo(todoItemId: string, userId: string): Promise<boolean> {
    logger.info('Deleting a todo');
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        todoId: todoItemId,
        userId: userId
      },
    }).promise()

    return true;
  }
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}