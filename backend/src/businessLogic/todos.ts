import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('Todos')
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = process.env.ATTACHMENT_S3_BUCKET


export async function getTodosPerUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos');

  return todosAccess.getTodosPerUser(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

  try {
    logger.info("Creating a new todo");

    const itemId = uuid.v4()

    return await todosAccess.createTodo({
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
    })
  } catch (error) {
    createError(error);
  }
}

export async function updateTodo(todoItem: TodoItem): Promise<TodoUpdate> {

  try {
    logger.info("Updating a todo");
    return await todosAccess.updateTodo(todoItem) as TodoUpdate;
  } catch (error) {
    createError(error);
  }
}


export async function deleteTodo(todoItemId: string, userId: string) {
  try {
    logger.info("Deleting a todo");

    return await todosAccess.deleteTodo(todoItemId, userId);
  } catch (error) {
    createError(error);
  }
}

export async function createAttachmentPresignedUrl(todoId: string) {


    return await attachmentUtils.getUploadUrl(todoId);
  
}