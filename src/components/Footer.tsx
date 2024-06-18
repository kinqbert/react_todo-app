import { useCurrentState, useTodosMethods } from '../store/reducer';
import { FilterField } from '../types/FilterField';
import cn from 'classnames';

interface Props {
  inputRef: React.RefObject<HTMLInputElement>;
}

export const Footer: React.FC<Props> = ({ inputRef }) => {
  const { todos, filterField } = useCurrentState();
  const { setFilterField, deleteTodoLocal, setTimeoutErrorMessage } =
    useTodosMethods();

  const { activeTodos: activeTodosAmount } = todos.reduce(
    (acc, todo) => {
      if (todo.completed) {
        acc.completedTodos += 1;
      } else {
        acc.activeTodos += 1;
      }

      return acc;
    },
    { activeTodos: 0, completedTodos: 0 },
  );

  const setFilter = (newFilterField: FilterField) => {
    if (filterField !== newFilterField) {
      setFilterField(newFilterField);
    }
  };

  const deleteCompleted = () => {
    try {
      const completedTodos = todos.filter(todo => todo.completed);
      completedTodos.forEach(todo => deleteTodoLocal(todo.id));
      inputRef.current?.focus();
    } catch {
      setTimeoutErrorMessage('Unable to delete completed todos');
    }
  };

  const hasCompleted = todos.some(todo => todo.completed);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeTodosAmount} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={cn('filter__link', {
            selected: filterField === FilterField.All,
          })}
          data-cy="FilterLinkAll"
          onClick={() => setFilter(FilterField.All)}
        >
          All
        </a>

        <a
          href="#/active"
          className={cn('filter__link', {
            selected: filterField === FilterField.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => setFilter(FilterField.Active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={cn('filter__link', {
            selected: filterField === FilterField.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => setFilter(FilterField.Completed)}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!hasCompleted}
        onClick={deleteCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
