import React, { Component, useState, useEffect } from "react";
import "./bulma.min.css";

const App = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [lastRender, setLastRender] = useState(0);
  const [query, setQuery] = useState("");

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

          <Header
            completed={items.filter((task) => task.completed).length}
            numTodos={items.length}
          />
          <LatestCreated tasks={items} />

          <input
            type="text"
            className="input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <TodoList
            tasks={items.filter((task) =>
              (task.name || "").toLowerCase().includes(query.toLowerCase())
            )}
            onEdit={(id, newName) => {
              fetch(`https://dev.teledirectasia.com:3092/tasks/${id}`, {
                method: "PUT",
                headers: {
                  Authorization: localStorage.getItem("token"),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: newName,
                }),
              })
                .then((res) => res.json())
                .then((result) => {
                  console.log(result);
                  setLastRender(Date.now());
                }, console.error);
            }}
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
    <section class="hero is-primary is-fullheight">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-centered">
            <div class="column is-5-tablet is-4-desktop is-3-widescreen">
              <form
                class="box"
                onSubmit={(e) => {
                  e.preventDefault();
                  props.onSubmit(nameValue, apiKey);
                }}
              >
                <h2 class="subtitle" style={{ color: "darkgray" }}>
                  Login
                </h2>

                <div class="field">
                  <div class="control">
                    <input
                      class="input"
                      name="apiKey"
                      type="password"
                      placeholder="Id"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>

                <div class="field">
                  <div class="controlt">
                    <input
                      class="input"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={nameValue}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div class="field">
                  <input
                    class="button is-primary is-fullwidth"
                    name="submit"
                    type="submit"
                    value="Login"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
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
        Task Completed {props.completed}/{props.numTodos}
      </h1>
    </div>
  );
};

const LatestCreated = (props) => {
  const latest = props.tasks.slice(-3).reverse();
  const latestList = latest.map((todo) => (
    <li key={todo._id}>
      {!todo.completed && todo.name}
      {todo.completed && <del>{todo.name}</del>}
    </li>
  ));

  return (
    <div className="card-header">
      <h1 className="card-header-title header">Latest Created</h1>
      <ul>{latestList}</ul>
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

const Todo = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(props.name);

  if (isEditing) {
    return (
      <div className="list-item">
        <form>
          <input
            type="text"
            className="input"
            placeholder="Enter Item"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
          <button
            className="button"
            onClick={(e) => {
              e.preventDefault();
              props.onEdit(props.id, currentValue);
              setIsEditing(false);
            }}
          >
            Save
          </button>
          <button
            className="button"
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="list-item">
      <label className="checkbox">
        <input
          type="checkbox"
          checked={props.completed}
          onChange={() => {
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
          }}
        />
        {!props.completed && props.name}
        {props.completed && <del>{props.name}</del>}
      </label>
      <button onClick={() => setIsEditing(true)}>Edit</button>

      <button
        onClick={() => {
          props.onDelete(props.id);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default App;
