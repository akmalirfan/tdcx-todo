import React, { Component, useState, useEffect } from "react";
import "./bulma.min.css";

const App = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [lastRender, setLastRender] = useState(0);
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);

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
  } else if (items.length === 0) {
    return (
      <section className="hero is-primary is-fullheight">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-5-tablet is-4-desktop is-3-widescreen">
                <div className="box">
                  <div className="card frame"></div>
                  <div className="has-text-centered">You have no task.</div>
                  <div className="panel-block">
                    <button
                      className="button is-primary is-fullwidth"
                      onClick={() => setIsActive(true)}
                    >
                      + New Task
                    </button>
                  </div>
                  <SubmitForm
                    modalClass={isActive ? "modal is-active" : "modal"}
                    onFormSubmit={(task) => {
                      setItems([...items, task]);
                      setLastRender(Date.now());
                    }}
                    onDismiss={() => setIsActive(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <section className="hero is-primary is-fullheight">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-5-tablet is-4-desktop is-3-widescreen">
                <div className="box">
                  <div className="card frame">
                    {localStorage.getItem("name")}
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

                    <div className="panel-block">
                      <p className="control">
                        <input
                          type="text"
                          className="input is-primary"
                          placeholder="Search by task name"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </p>
                    </div>

                    <div className="panel-block">
                      <button
                        className="button is-primary is-fullwidth"
                        onClick={() => setIsActive(true)}
                      >
                        + New Task
                      </button>
                    </div>

                    <TodoList
                      tasks={items.filter((task) =>
                        (task.name || "")
                          .toLowerCase()
                          .includes(query.toLowerCase())
                      )}
                      onEdit={(id, newName) => {
                        fetch(
                          `https://dev.teledirectasia.com:3092/tasks/${id}`,
                          {
                            method: "PUT",
                            headers: {
                              Authorization: localStorage.getItem("token"),
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              name: newName,
                            }),
                          }
                        )
                          .then((res) => res.json())
                          .then((result) => {
                            console.log(result);
                            setLastRender(Date.now());
                          }, console.error);
                      }}
                      onToggle={() => setLastRender(Date.now())}
                      onDelete={(id) => {
                        fetch(
                          `https://dev.teledirectasia.com:3092/tasks/${id}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: localStorage.getItem("token"),
                            },
                          }
                        )
                          .then((res) => res.json())
                          .then((result) => {
                            console.log(result);
                            setLastRender(Date.now());
                          }, console.error);
                      }}
                    />
                    <SubmitForm
                      modalClass={isActive ? "modal is-active" : "modal"}
                      onFormSubmit={(task) => {
                        setItems([...items, task]);
                        setLastRender(Date.now());
                      }}
                      onDismiss={() => setIsActive(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

const LoginForm = (props) => {
  const [nameValue, setName] = useState("");
  const [apiKey, setApiKey] = useState("");

  return (
    <section className="hero is-primary is-fullheight">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-5-tablet is-4-desktop is-3-widescreen">
              <form
                className="box"
                onSubmit={(e) => {
                  e.preventDefault();
                  props.onSubmit(nameValue, apiKey);
                }}
              >
                <h2 className="subtitle" style={{ color: "darkgray" }}>
                  Login
                </h2>

                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      name="apiKey"
                      type="password"
                      placeholder="Id"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="controlt">
                    <input
                      className="input"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={nameValue}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <input
                    className="button is-primary is-fullwidth"
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
    this.props.onDismiss();
  };

  render() {
    return (
      <div className={this.props.modalClass}>
        <div className="modal-background" onClick={this.props.onDismiss}></div>
        <div className="modal-content">
          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              className="input"
              placeholder="Task Name"
              value={this.state.term}
              onChange={(e) => this.setState({ term: e.target.value })}
            />
            <button className="button is-primary is-fullwidth">
              + New Task
            </button>
          </form>
        </div>
      </div>
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
      <ul className="list-item">{latestList}</ul>
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
        className="delete"
        onClick={() => {
          props.onDelete(props.id);
        }}
      />
    </div>
  );
};

export default App;
