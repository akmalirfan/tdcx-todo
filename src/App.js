import React, { Component, useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [lastRender, setLastRender] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch("https://dev.teledirectasia.com:3092/tasks", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then(
          (result) => {
            setIsLoaded(true);
            setItems(result.tasks);
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        );
    }
  }, [token, lastRender]);

  if (!localStorage.getItem("token")) {
    return (
      <LoginForm
        onSubmit={(name, apiKey) => {
          // Get token
          fetch("https://dev.teledirectasia.com:3092/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              apiKey,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              localStorage.setItem("name", result.token.name);
              localStorage.setItem("token", result.token.token);
              setToken(result.token.token);
            }, console.error);
        }}
      />
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="wrapper">
        <div className="card frame">
          <button
            onClick={() => {
              localStorage.clear();
              setToken("");
            }}
          >
            Log out
          </button>
          <Header numTodos={items.length} />
          <TodoList
            tasks={items}
            onEdit={console.log}
            onToggle={() => setLastRender(Date.now())}
            onDelete={(id) => {
              fetch(`https://dev.teledirectasia.com:3092/tasks/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              })
                .then((res) => res.json())
                .then((result) => {
                  console.log(result);
                  setLastRender(Date.now());
                }, console.error);
            }}
          />
          <SubmitForm
            onFormSubmit={(task) => {
              setItems([...items, task]);
              setLastRender(Date.now());
            }}
          />
        </div>
      </div>
    );
  }
};

const LoginForm = (props) => {
  const [nameValue, setName] = useState("");
  const [apiKey, setApiKey] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(nameValue, apiKey);
      }}
    >
      <input
        name="name"
        type="text"
        value={nameValue}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        name="apiKey"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <input name="submit" type="submit" />
    </form>
  );
};

class SubmitForm extends Component {
  state = { term: "" };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.term === "") return;

    fetch("https://dev.teledirectasia.com:3092/tasks", {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.term,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        this.props.onFormSubmit({
          _id: Date.now(),
          name: result.name,
        });
      }, console.error);
    this.setState({ term: "" });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Enter Item"
          value={this.state.term}
          onChange={(e) => this.setState({ term: e.target.value })}
        />
        <button className="button">Submit</button>
      </form>
    );
  }
}

const Header = (props) => {
  return (
    <div className="card-header">
      <h1 className="card-header-title header">
        You have {props.numTodos} Todos
      </h1>
    </div>
  );
};

const TodoList = (props) => {
  const todos = props.tasks.map((todo) => {
    return (
      <Todo
        name={todo.name}
        key={todo._id}
        id={todo._id}
        onEdit={props.onEdit}
        onToggle={props.onToggle}
        onDelete={props.onDelete}
        completed={todo.completed}
      />
    );
  });
  return <div className="list-wrapper">{todos}</div>;
};

const Todo = (props) => (
  <div className="list-item">
    <label className="checkbox">
      <input type="checkbox" checked={props.completed} onChange={() => {
        fetch(`https://dev.teledirectasia.com:3092/tasks/${props.id}`, {
          method: "PUT",
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !props.completed,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            console.log(result);
            props.onToggle();
          }, console.error);
      }}/>
      {!props.completed && props.name}
      {props.completed && <del>{props.name}</del>}
    </label>
    <button
      onClick={() => {
        props.onEdit(props.id);
      }}
    >
      Edit
    </button>

    <button
      className="delete is-pulled-right"
      onClick={() => {
        props.onDelete(props.id);
      }}
    >
      x
    </button>
  </div>
);

export default App;
