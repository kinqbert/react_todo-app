import cn from 'classnames';
import { Todo } from '../types/Todo';
import { useRef, useState, useEffect } from 'react';
import { useTodosMethods } from '../store/reducer';

interface Props {
  todo: Todo;
  isTemp?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const TodoComponent: React.FC<Props> = ({
  todo,
  isTemp = false,
  inputRef,
}) => {
  const { deleteTodoLocal, modifyTodoLocal, setTimeoutErrorMessage } =
    useTodosMethods();

  const [loading, setLoading] = useState(false);
  const [beingEdited, setBeingEdited] = useState(false);
  const [editedValue, setEditedValue] = useState('');
  const [title, setTitle] = useState(todo.title);

  const formInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (beingEdited) {
      formInputRef.current?.focus();
      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setBeingEdited(false);
        }
      };

      document.addEventListener('keyup', handleKeyUp);

      return () => {
        document.removeEventListener('keyup', handleKeyUp);
      };
    }

    return () => {};
  }, [beingEdited]);

  const onDelete = (todoId: number) => {
    setLoading(true);
    try {
      deleteTodoLocal(todoId);
      inputRef.current?.focus();
    } catch (error) {
      setTimeoutErrorMessage('Unable to delete a todo');
    } finally {
      setLoading(false);
    }
  };

  const onTodoStatusToggle = () => {
    setLoading(true);
    const updatedTodo = { ...todo, completed: !todo.completed };

    try {
      modifyTodoLocal(updatedTodo.id, { completed: updatedTodo.completed });
    } catch (error) {
      setTimeoutErrorMessage('Unable to update a todo');
    } finally {
      setLoading(false);
    }
  };

  const onTitleDoubleClick = (modifiedTodo: Todo) => {
    setBeingEdited(true);
    setEditedValue(modifiedTodo.title);
  };

  const onSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }

    const normalizedEditedValue = editedValue.trim();

    if (normalizedEditedValue === todo.title) {
      setBeingEdited(false);
      return;
    }

    setLoading(true);
    setTitle(normalizedEditedValue);
    if (!normalizedEditedValue) {
      try {
        deleteTodoLocal(todo.id);
        setBeingEdited(false);
        inputRef.current?.focus();
      } catch (error) {
        setTimeoutErrorMessage('Unable to delete a todo');
        formInputRef.current?.focus();
      } finally {
        setLoading(false);
      }
      return;
    }

    const todoProps = { title: normalizedEditedValue };

    try {
      modifyTodoLocal(todo.id, todoProps);
      setBeingEdited(false);
    } catch (error) {
      setTimeoutErrorMessage('Unable to update a todo');
      formInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const onBlur = () => {
    if (editedValue.trim() === todo.title) {
      setBeingEdited(false);
    } else {
      onSubmit();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
      key={todo.id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onChange={onTodoStatusToggle}
          checked={todo.completed}
        />
      </label>

      {beingEdited && (
        <form onSubmit={onSubmit}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            value={editedValue}
            ref={formInputRef}
            onChange={event => setEditedValue(event.target.value)}
            onBlur={onBlur}
          />
        </form>
      )}

      {!beingEdited && (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => onTitleDoubleClick(todo)}
        >
          {title}
        </span>
      )}

      {!beingEdited && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(todo.id)}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${(isTemp || loading) && 'is-active'}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
