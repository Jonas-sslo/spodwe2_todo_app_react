import { useState, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("http://localhost:3000/todos");
        if (!response.ok) {
          throw new Error("Erro ao buscar os dados");
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        setError("Falha ao carregar tarefas");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const addTodo = async (text) => {
    try {
      const newTodo = { id: crypto.randomUUID(), text, done: false };

      const response = await fetch("http://localhost:3000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar tarefa");
      }

      const createdTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, createdTodo]);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      setError("Falha ao adicionar tarefa");
    }
  };

  const updateTodoStatus = async (id, done) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar tarefa");
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, done } : todo
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      setError("Falha ao atualizar tarefa");
    }
  };

  const markTodoAsDone = (id) => {updateTodoStatus(id, true)};

  const markTodoAsUndone = (id) => {updateTodoStatus(id, false)};

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === Filter.ALL) return true
    if (currentFilter === Filter.DONE) return todo.done
    if (currentFilter === Filter.PENDING) return !todo.done
    return true
  })

  if (isLoading) {
    return <div className="center-content">Carregando...</div>;
  }

  if (error) {
    return <div className="center-content">{error}</div>;
  }

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