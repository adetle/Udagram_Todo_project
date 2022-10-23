import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl} from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl');


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info("Generating upload url");

    const attachmentUrl = await createAttachmentPresignedUrl(todoId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        "uploadUrl": attachmentUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
