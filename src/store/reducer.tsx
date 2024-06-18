/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-case-declarations */
import React, { useContext, useReducer, useEffect } from 'react';
import { FilterField } from '../types/FilterField';
import { State, Action, ActionType } from '../types/ReducerTypes';
import { Todo } from '../types/Todo';
import { TodoMethods } from '../types/TodoMethods';
import { getTodos, setTodosToLocalStorage } from '../localStorage/todos';

interface Props {
  children: React.ReactNode;
}

const initialState: State = {
  todos: [],
  filterField: FilterField.All,
  errorMessage: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SetTodos:
      return {
        ...state,
        todos: action.payload,
      };

    case ActionType.AddTodo:
      const newTodos = [...state.todos, action.payload];
      setTodosToLocalStorage(newTodos);
      return {
        ...state,
        todos: newTodos,
      };

    case ActionType.DeleteTodo:
      const remainingTodos = state.todos.filter(
        todo => todo.id !== action.payload,
      );
      setTodosToLocalStorage(remainingTodos);
      return {
        ...state,
        todos: remainingTodos,
      };

    case ActionType.ModifyTodo:
      const modifiedTodos = state.todos.map(todo =>
        todo.id === action.payload.todoId
          ? { ...todo, ...action.payload.todoProps }
          : todo,
      );
      setTodosToLocalStorage(modifiedTodos);
      return {
        ...state,
        todos: modifiedTodos,
      };

    case ActionType.SetFilterField:
      return {
        ...state,
        filterField: action.payload,
      };

    case ActionType.SetErrorMessage:
      return {
        ...state,
        errorMessage: action.payload,
      };

    case ActionType.ClearErrorMessage:
      return {
        ...state,
        errorMessage: '',
      };

    default:
      return state;
  }
}

const StateContext = React.createContext(initialState);
const DispatchContext = React.createContext<React.Dispatch<Action>>(() => {});

export const useCurrentState = () => {
  const { todos, filterField, errorMessage } = useContext(StateContext);

  return {
    todos,
    filterField,
    errorMessage,
  };
};

export const useTodosMethods = (): TodoMethods => {
  const dispatch = useContext(DispatchContext);

  const setTodosLocal = (todos: Todo[]) => {
    dispatch({ type: ActionType.SetTodos, payload: todos });
  };

  const addTodoLocal = (todo: Todo) => {
    dispatch({ type: ActionType.AddTodo, payload: todo });
  };

  const deleteTodoLocal = (todoId: number) => {
    dispatch({ type: ActionType.DeleteTodo, payload: todoId });
  };

  const setFilterField = (filterField: FilterField) => {
    dispatch({ type: ActionType.SetFilterField, payload: filterField });
  };

  const modifyTodoLocal = (todoId: number, todoProps: Partial<Todo>) => {
    dispatch({ type: ActionType.ModifyTodo, payload: { todoId, todoProps } });
  };

  const setTimeoutErrorMessage = (message: string, delay = 3000) => {
    dispatch({
      type: ActionType.SetErrorMessage,
      payload: message,
    });

    setTimeout(() => {
      dispatch({
        type: ActionType.ClearErrorMessage,
      });
    }, delay);
  };

  return {
    setTodosLocal,
    addTodoLocal,
    deleteTodoLocal,
    modifyTodoLocal,
    setFilterField,
    setTimeoutErrorMessage,
  };
};

export const GlobalStateProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load todos from local storage on mount
  useEffect(() => {
    const storedTodos = getTodos();
    if (storedTodos.length) {
      dispatch({ type: ActionType.SetTodos, payload: storedTodos });
    }
  }, []);

  // Store todos in local storage whenever they change
  useEffect(() => {
    setTodosToLocalStorage(state.todos);
  }, [state.todos]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};
