import React, { useState, useEffect, useRef } from 'react';

import { Todo } from './types/Todo';

import { useCurrentState, useTodosMethods } from './store/reducer';

import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const { todos } = useCurrentState();
  const { addTodoLocal, modifyTodoLocal, setTimeoutErrorMessage } =
    useTodosMethods();

  const [input, setInput] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim()) {
      setTimeoutErrorMessage('Title should not be empty');
      return;
    }

    const newTodo: Todo = {
      id: Date.now(), // Use Date.now() for a unique id
      title: input.trim(),
      completed: false,
    };

    if (inputRef.current) {
      inputRef.current.disabled = true;
    }

    setTempTodo(newTodo);

    try {
      // Add the new todo to local storage
      addTodoLocal(newTodo);
      setInput('');
    } catch {
      setTimeoutErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
      if (inputRef.current) {
        inputRef.current.disabled = false;
        inputRef.current.focus();
      }
    }
  };

  const onToggleAll = () => {
    const areAllCompleted = todos.every(todo => todo.completed);
    const todoProps = { completed: !areAllCompleted };

    for (const todo of todos) {
      if (todo.completed !== todoProps.completed) {
        try {
          modifyTodoLocal(todo.id, todoProps);
        } catch {
          setTimeoutErrorMessage('Unable to update a todo');
        }
      }
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {!!todos.length && (
            <button
              type="button"
              className={`todoapp__toggle-all ${todos.every(todo => todo.completed) && 'active'}`}
              data-cy="ToggleAllButton"
              onClick={onToggleAll}
            />
          )}

          <form onSubmit={onSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              ref={inputRef}
              value={input}
              onChange={event => setInput(event.target.value)}
            />
          </form>
        </header>

        <TodoList tempTodo={tempTodo} inputRef={inputRef} />

        {!!todos.length && <Footer inputRef={inputRef} />}
      </div>

      <ErrorNotification />
    </div>
  );
};
