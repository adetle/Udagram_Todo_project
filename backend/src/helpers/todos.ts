import { TodosAccess } from '../helpers/todosAccess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';
// import { TodoUpdate } from '../models/TodoUpdate';

// Implement businessLogic

const logger = createLogger('Todos')


const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosPerUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos');

  return todosAccess.getTodosPerUser(userId)
}

export async function getUniqueTodoPerUser(todoId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos');

  return todosAccess.getTodosPerUser(todoId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

  try {
    logger.info("Creating a new todo");

    if (createTodoRequest.name.trim().length == 0) {
      throw new Error("Name cannot be an empty string");
    }

    const itemId = uuid.v4()

    return await todosAccess.createTodo({
      todoId: itemId,
      userId: userId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: `https://${AttachmentUtils.bucketName}.s3.amazonaws.com/${itemId}`
    })
  } catch (error) {
    createError(error);
  }
}

export async function updateTodo(
  todoItemId: string,
  updateTodoRequest: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {

  try {
    logger.info("Updating a todo");


    if (updateTodoRequest.name.trim().length == 0) {
      throw new Error("Name cannot be an empty string");
    }

    return await todosAccess.updateTodo(todoItemId = todoItemId, updateTodoRequest, userId) as TodoUpdate;
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

export async function createAttachmentPresignedUrl(userId: string, todoId: string) {
  try {
    if (!userId)
      throw new Error("todo Id is missing");

    return await attachmentUtils.getUploadUrl(todoId);
  } catch (error) {
    createError(error);
  }
}