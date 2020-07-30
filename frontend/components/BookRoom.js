import React from "react";

import Calendar from "../components/Calendar";

import "../public/styles/components/bookRoom.module.scss";

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

    this.calendarRef = React.createRef();

    this.showCalendar = this.showCalendar.bind(this);
    this.book = this.book.bind(this);
  }

  makeDateString(date) {
    return `${date.day}.${date.month}.${date.year}`;
  }

  createPrices() {
    if (this.state.price !== null) {
      let head = (
            <tr key="0">
              <th key="0">Количество<br/>гостей</th>
              <th key="1">Цена</th>
            </tr>
          ),
          body = new Array();

      for (let i = 0; i < this.state.price.length; i += 1) {
        body.push(
          <tr key={i + 1}>
            <td key="0">{i + 1}</td>
            <td key="1">{this.state.price[i]}</td>
          </tr>
        );
      }

      return (
        <table className="room-prices-table">
          <thead>
            {head}
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
      );
    } else {
      return (
        <p className="room-prices-null">
          Выберите дату своего проживания, чтобы узнать итоговую цену.
        </p>
      );
    }
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

  book(event) {
    event.preventDefault();
    if (this.props.user.isAuthenticated) {
      window.location.href = '/messages';
    } else {
      window.localStorage.setItem('firstBooking',
        `${this.state.from.day}.${this.state.from.month}.${this.state.from.year}` +
        `_${this.state.to.day}.${this.state.to.month}.${this.state.to.year}`
      );

      window.location.href = '/messages/welcome';
    }
  }

  render() {
    let inputs = [],
        calendarStyle,
        submitButton,
        calendar;

    if (this.state.from && this.state.to) {
      submitButton = (
        <input
          type="submit"
          className="date-submit"
          value="Забронировать"
          onClick={this.book}
        />
      );
    } else {
      submitButton = null;
    }

    if (this.state.provoker === null) {
      calendar = (
        <Calendar
          parentClass={this}
          bookings={this.props.bookings}
          convertNumberToMonth={this.props.convertNumberToMonth}
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
            convertNumberToMonth={this.props.convertNumberToMonth}
            target={this.state.provoker} show={this.state.calendarShown}
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
      <div className="content-flex-wrapper">
        <div className="book-room">
          <h2>
            Забронировать
          </h2>
          <form className="flex-book-form">
            {inputs}
            {calendar}
            {submitButton}
          </form>
        </div>
        <div className="room-prices">
          <h2>
            Цены
          </h2>
          {this.createPrices()}
        </div>
      </div>
    )
  }
}