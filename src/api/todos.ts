import { Todo } from '../types/Todo';

const LOCAL_STORAGE_KEY = 'todos';

export const getTodos = (): Promise<Todo[]> => {
  const todos = localStorage.getItem(LOCAL_STORAGE_KEY);
  return Promise.resolve(todos ? JSON.parse(todos) : []);
};

export const setTodosToLocalStorage = (todos: Todo[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
};
