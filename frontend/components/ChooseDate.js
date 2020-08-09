import React from "react";

import Calendar from "../components/Calendar";

import "../public/styles/components/chooseDate.scss";

export default class BookRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calendarShown: false,
      provoker: null,
      from: null,
      to: null,
      price: null
    }

    this.convertNumberToMonth= [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь'
    ];

    this.calendarRef = React.createRef();

    this.showCalendar = this.showCalendar.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  componentDidUpdate() {
    if (this.state.dataSent === false) {
      this.props.setData(this.state.from, this.state.to);
      this.state.dataSent = true;  
    }
  }

  makeDateString(date) {
    return `${date.day}.${date.month}.${date.year}`;
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
        to: null,
        price: null
      });
    } else {
      this.setState({
        calendarShown: false,
        provoker: null,
        from: null,
        to: null,
        price: null
      });
    }
  }

  render() {
    let inputs = [],
        calendar;

    if (this.state.provoker === null) {
      calendar = (
        <Calendar
          parentClass={this}
          bookings={this.props.bookings}
          convertNumberToMonth={this.convertNumberToMonth}
          target={this.state.provoker}
          show={this.state.calendarShown}
          from={this.props.from}
          to={this.props.to}
        />
      );
      inputs.push(
        <div key={0} className="from input-date clickable" onClick={this.showCalendar}>
          {this.state.from ? this.makeDateString(this.state.from) : 'Дата заезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
      inputs.push(
        <div key={1} className="to input-date clickable" onClick={this.showCalendar}>
          {this.state.to ? this.makeDateString(this.state.to) : 'Дата выезда'}
          <i className="fas fa-caret-down" />
        </div>
      );
    } else {
      calendar = (
        <div className="calendar-wrapper">
          <Calendar
            parentClass={this}
            bookings={this.props.bookings}
            target={this.state.provoker}
            convertNumberToMonth={this.convertNumberToMonth}
            show={this.state.calendarShown}
            from={this.props.from}
            to={this.props.to}
          />
        </div>
      );
      if (this.state.provoker.classList[0] === 'from') {
        inputs.push(
          <div
            key={0}
            className="from input-date clickable turned"
            onClick={this.showCalendar}
          >
            {this.state.from ? this.makeDateString(this.state.from) : 'Дата заезда'}
            <i className="fas fa-caret-down" />
          </div>
        );
        inputs.push(
          <div key={1} className="to input-date">
            {this.state.to ? this.makeDateString(this.state.to) : 'Дата выезда'}
            <i className="fas fa-caret-down" />
          </div>
        );
      } else {
        inputs.push(
          <div key={0} className="from input-date">
            {this.state.from ? this.makeDateString(this.state.from) : 'Дата заезда'}
            <i className="fas fa-caret-down" />
          </div>
        );
        inputs.push(
          <div
            key={1}
            className="to input-date clickable turned"
            onClick={this.showCalendar}
          >
            {this.state.to ? this.state.to : 'Дата выезда'}
            <i className="fas fa-caret-down" />
          </div>
        );
      }
    } 

    return (
      <React.Fragment>
        {inputs}
        {calendar}
      </React.Fragment>
    );
  }
}