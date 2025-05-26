import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Filter = {
  ALL: "all",
  DONE: "done",
  PENDING: "pending"
};

const AddTodo = ({ addTodo }) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const input = event.target;
      const text = input.value.trim();
      if (text) {
        addTodo(text);
        input.value = "";
      }
    }
  };

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
    todo.done ? markTodoAsUndone(todo.id) : markTodoAsDone(todo.id);
  };

  return (
    <>
      {todo.done ? (
        <li>
          <span style={{ textDecoration: "line-through" }}>
            {todo.text}
          </span>
          <button style={{ backgroundColor: "grey" }} onClick={handleClick}>
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


const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(Filter.ALL);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:3000";

  const fetchTodos = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error("Erro ao buscar os dados");
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
      setError(error.message || "Falha ao carregar tarefas");
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (text) => {
    if (!token) return;
    setError(null);
    try {
      const newTodoPayload = { text, done: false };

      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newTodoPayload),
      });

      if (!response.ok) {
         if (response.status === 401) {
          logout();
          navigate('/login');
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error("Erro ao adicionar tarefa");
      }

      const createdTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, createdTodo]);
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      setError(error.message || "Falha ao adicionar tarefa");
    }
  };

  const updateTodoStatus = async (id, done) => {
    if (!token) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ done }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate('/login');
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        throw new Error("Erro ao atualizar tarefa");
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, done } : todo
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      setError(error.message || "Falha ao atualizar tarefa");
    }
  };

  const markTodoAsDone = (id) => updateTodoStatus(id, true);
  const markTodoAsUndone = (id) => updateTodoStatus(id, false);

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === Filter.ALL) return true;
    if (currentFilter === Filter.DONE) return todo.done;
    if (currentFilter === Filter.PENDING) return !todo.done;
    return true;
  });

  if (isLoading) {
    return <div className="container center-content">Carregando...</div>;
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Lista de Tarefas</h1>
        <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <AddTodo addTodo={addTodo} />
      <TodoFilter currentFilter={currentFilter} setFilter={setCurrentFilter} />
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
    </main>
  );
};

export default TodoPage;