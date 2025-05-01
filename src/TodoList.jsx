import { useState } from "react";

const Filter = {
  ALL: "all",
  DONE: "done",
  PENDING: "pending"
};

const AddTodo = ( { addTodo }) => {

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const input = event.target;
      const text = input.value.trim();
      if (text) {
        addTodo(text);
        input.value = "";
      }
    }
  }

  return (
    <input
      type="text"
      placeholder="Adicionar tarefa"
      onKeyDown={handleKeyPress}
    />
  );
};

const TodoFilter = ({ currentFilter, setFilter }) => {
  return (
    <div className="center-content">
      <a 
        href="#" 
        id="all" 
        className={currentFilter === Filter.ALL ? "active" : ""}
        onClick={(e) => {
          e.preventDefault();
          setFilter(Filter.ALL);
        }}
      >
        Todos os itens
      </a>
      <a 
        href="#" 
        id="done"
        className={currentFilter === Filter.DONE ? "active" : ""}
        onClick={(e) => {
          e.preventDefault();
          setFilter(Filter.DONE);
        }}
      >
        Concluídos
      </a>
      <a 
        href="#" 
        id="pending"
        className={currentFilter === Filter.PENDING ? "active" : ""}
        onClick={(e) => {
          e.preventDefault();
          setFilter(Filter.PENDING);
        }}
      >
        Pendentes
      </a>
    </div>
  );
};

const TodoItem = ({ todo, markTodoAsDone, markTodoAsUndone }) => {
  
  const handleClick = () => {
    todo.done ? markTodoAsUndone(todo.id) : markTodoAsDone(todo.id)
  }
  
  return (
    <>
      {todo.done ? (
        <li>
          <span style={{ textDecoration: "line-through" }}>
            {todo.text}
          </span>
          <button style={{ backgroundColor: "grey" }}
          onClick={handleClick}>
            Desfazer
            </button>
        </li>
      ) : (
        <li>
          {todo.text}
          <button onClick={handleClick}>Concluir</button>
        </li>
      )}
    </>
  );
};

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(Filter.ALL);

  const addTodo = (text) => {
    const newTodo = { id: crypto.randomUUID(), text, done: false };
    setTodos((prevTodos) => [...prevTodos, newTodo]);
  }

  const markTodoAsDone = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, done: true } : todo
      )
    )
  }

  const markTodoAsUndone = (id) => {
    setTodos((prevTodos) => 
      prevTodos.map((todo) => 
        todo.id === id ? { ...todo, done: false } : todo)
    )
  }

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === Filter.ALL) return true
    if (currentFilter === Filter.DONE) return todo.done
    if (currentFilter === Filter.PENDING) return !todo.done
    return true
  })

  return (
    <>
      <h1>Lista de Tarefas</h1>
      <AddTodo addTodo={addTodo} />
      <TodoFilter currentFilter={currentFilter} setFilter={setCurrentFilter}/>
      <ul id="todo-list">
      {filteredTodos.map((todo) => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            markTodoAsDone={markTodoAsDone} 
            markTodoAsUndone={markTodoAsUndone}
          />
        ))}
      </ul>
    </>
  );
};

export { TodoList };