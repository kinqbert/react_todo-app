import { Todo } from '../types/Todo';

const LOCAL_STORAGE_KEY = 'react_todo-app_todos';

export const getTodos = (): Todo[] => {
  const todos = localStorage.getItem(LOCAL_STORAGE_KEY);
  return todos ? JSON.parse(todos) : ([] as Todo[]);
};

export const setTodosToLocalStorage = (todos: Todo[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
};
