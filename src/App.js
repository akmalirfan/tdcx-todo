import React, { Component, useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("https://dev.teledirectasia.com:3092/tasks", {
      headers: {
        Authorization: "e232f6d9706cda338431c633",
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
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="wrapper">
        <div className="card frame">
          <Header numTodos={items.length} />
          <TodoList
            tasks={items}
            onEdit={console.log}
            onDelete={(id) => {
              fetch(`https://dev.teledirectasia.com:3092/tasks/${id}`, {
                method: "DELETE",
                headers: {
                  Authorization: "e232f6d9706cda338431c633"
                },
              })
                .then((res) => res.json())
                .then(console.log, console.error);

              setItems(items);
            }}
          />
          <SubmitForm
            onFormSubmit={(task) => {
              setItems([...items, task]);
            }}
          />
        </div>
      </div>
    );
  }
};

class SubmitForm extends Component {
  state = { term: "" };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.term === "") return;

    fetch("https://dev.teledirectasia.com:3092/tasks", {
      method: "POST",
      headers: {
        Authorization: "e232f6d9706cda338431c633",
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
      <Todo name={todo.name} key={todo._id} id={todo._id} onEdit={props.onEdit} onDelete={props.onDelete} completed={todo.completed} />
    );
  });
  return <div className="list-wrapper">{todos}</div>;
};

const Todo = (props) => (
  <div className="list-item">
    {!props.completed && props.name}
    {props.completed && <del>{props.name}</del>}
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
