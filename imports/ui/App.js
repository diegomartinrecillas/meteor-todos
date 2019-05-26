import React, { Component } from "react";
import { Meteor } from "meteor/meteor";

import { withTracker } from "meteor/react-meteor-data";

import { Tasks } from "../api/tasks.js";
import Task from "./Task.js";
import AccountsUIWrapper from "./AccountsUIWrapper.js";

// App component - represents the whole app
class App extends Component {
  state = {
    task: "",
    hideCompleted: false
  };

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map(task => {
      const currentUserId =
        this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    Meteor.call("tasks.insert", this.state.task.trim());

    this.setState({ task: "" });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
        </header>

        <h1>Todo List ({this.props.incompleteCount})</h1>

        <label className="hide-completed">
          <input
            type="checkbox"
            readOnly
            checked={this.state.hideCompleted}
            onClick={this.toggleHideCompleted.bind(this)}
          />
          Hide Completed Tasks
        </label>

        <AccountsUIWrapper />

        {this.props.currentUser ? (
          <form className="new-task" onSubmit={e => this.handleSubmit(e)}>
            <input
              onChange={e => this.setState({ task: e.target.value })}
              value={this.state.task}
              type="text"
              placeholder="Type to add new tasks"
            />
          </form>
        ) : (
          ""
        )}

        <ul>{this.renderTasks()}</ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe("tasks");

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  };
})(App);
