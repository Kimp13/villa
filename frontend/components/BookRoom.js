import React from "react";

import Calendar from "../components/Calendar";

import "../public/styles/components/bookRoom.scss";

export default class BookRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      calendarShown: false,
      provoker: null,
      from: null,
      to: null
    }
    this.calendarRef = React.createRef();
    this.showCalendar = this.showCalendar.bind(this);
  }

  showCalendar(event) {
    let target = event.target;
    while (target.nodeName.toLowerCase() !== 'div') {
      target = target.parentNode;
    }
    if (this.state.provoker === null) {
      this.setState({
        calendarShown: true,
        provoker: target,
        from: null,
        to: null
      });
    } else {
      this.setState({
        calendarShown: false,
        provoker: null,
        from: null,
        to: null
      });
    }
  }

  render() {
    let inputs = [], calendarStyle,
        submitButton;

    if (this.state.from && this.state.to) {
      submitButton = <input type="submit" />;
    } else {
      submitButton = null;
    }

    if (this.state.provoker === null) {
      inputs.push(
        <div key={0} className="from input-date clickable" onClick={this.showCalendar}>
          {this.state.from ? this.state.from : 'Дата заезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
      inputs.push(
        <div key={1} className="to input-date clickable" onClick={this.showCalendar}>
          {this.state.to ? this.state.to : 'Дата выезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
    } else if (this.state.provoker.classList[0] === 'from') {
      inputs.push(
        <div key={0} className="from input-date clickable turned" onClick={this.showCalendar}>
          {this.state.from ? this.state.from : 'Дата заезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
      inputs.push(
        <div key={1} className="to input-date">
          {this.state.to ? this.state.to : 'Дата выезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
    } else {
      inputs.push(
        <div key={0} className="from input-date">
          {this.state.from ? this.state.from : 'Дата заезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
      inputs.push(
        <div key={1} className="to input-date clickable turned" onClick={this.showCalendar}>
          {this.state.to ? this.state.to : 'Дата выезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
    }
    return (
      <div className="book-room">
        <h2>
          Забронировать
        </h2>
        <form className="flex-book-form">
          {inputs}
          <Calendar parentClass={this} bookings={this.props.bookings} convertNumberToMonth={this.props.convertNumberToMonth} target={this.state.provoker} show={this.state.calendarShown} from={this.props.from} to={this.props.to}/>
          {submitButton}
        </form>
      </div>
    )
  }
}