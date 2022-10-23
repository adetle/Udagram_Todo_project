import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
const middy = require('middy')
const { cors, httpErrorHandler } = require('middy/middlewares')

import { getTodosPerUser as getTodosPerUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('GetTodos');

// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here

    logger.info("Getting todos");
    const userId = getUserId(event);
    const todos = await getTodosPerUser(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        "items": todos
      })
    }
  });

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )