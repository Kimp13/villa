import React from "react";

import "../public/styles/components/calendar.scss";

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: this.props.from.month,
      currentYear: this.props.from.year
    }
    this.switchMonth = this.switchMonth.bind(this);
  }

  componentDidMount() {
    let calendar = document.getElementsByClassName('calendar')[0],
        sizes = calendar.getBoundingClientRect();
    if (sizes.top < 0) {
      calendar.style.top = 0;
    }
    if (sizes.right < 0) {
      calendar.style.right = 0;
    }
    if (sizes.bottom < 0) {
      calendar.style.bottom = 0;
    }
    if (sizes.left < 0) {
      calendar.style.left = 0;
    }
  }

  getDaysAmountInMonthOfYear(month, year) {
    let isYearLeap = false;
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      isYearLeap = true;
    }
    if (month < 7) {
      if (month === 1) {
        return isYearLeap ? 29 : 28;
      }
      return 30 + (month + 1) % 2;
    }
    return 30 + month % 2;
  }

  returnThisMonthBookings(bookings, month, year, from, to) {
    let result = [], i = 0;
    while (bookings[i].to.year < year) {
      i += 1;
      if (i === bookings.length) return [];
    }
    while (bookings[i].to.month < month) {
      i += 1;
      if (i === bookings.length) return [];
    }
    if (bookings[i].from.month > month || (bookings[i].from.month === month && bookings[i].from.day > to)) return [];
    while (bookings[i].to.month === month && bookings[i].to.day <= from) {
      i += 1;
      if (i === bookings.length) return [];
    }
    if (bookings[i].from.month > month) return [];
    result.push(bookings[i]);
    i += 1;
    while (bookings[i].from.month === month && bookings[i].from.day <= to) {
      result.push(bookings[i]);
      i += 1;
      if (i === bookings.length) return result;
    }
    return result;
  }

  switchMonth(event) {
    let target = event.target;
    while (target.nodeName !== 'BUTTON') {
      target = target.parentNode;
    }
    if (target.classList.length === 1) {
      if (target.classList[0].substring(16) === 'next') {
        if (this.state.currentMonth === 11) {
          this.setState({
            currentMonth: 0,
            currentYear: this.state.currentYear + 1
          });
        } else {
          this.setState({
            currentMonth: this.state.currentMonth + 1,
            currentYear: this.state.currentYear
          });
        }
      } else {
        if (this.state.currentMonth === 0) {
          this.setState({
            currentMonth: 11,
            currentYear: this.state.currentYear - 1
          });
        } else {
          this.setState({
            currentMonth: this.state.currentMonth - 1,
            currentYear: this.state.currentYear
          });
        }
      }
    }
  }

  toggleInfo() {
    let calendar = document.getElementsByClassName('calendar')[0];
    if (calendar.classList.contains('info-shown')) {
      calendar.classList.remove('info-shown');
    } else {
      calendar.classList.add('info-shown');
    }
  }

  render() {
    let style,
        firstButtonClassName = 'calendar-header-previous',
        secondButtonClassName = 'calendar-header-next',
        weekDays = [
          'ПН',
          'ВТ',
          'СР',
          'ЧТ',
          'ПТ',
          'СБ',
          'ВС'
        ],
        dayBricks = [],
        weekDayOfMonth = ((new Date(`${this.state.currentYear}-${this.state.currentMonth + 1}-1`).getDay()) + 6) % 7,
        lastMonthDayCount = this.getDaysAmountInMonthOfYear(this.state.currentMonth === 0 ? 11 : this.state.currentMonth - 1, this.state.currentYear),
        thisMonthDayCount = this.getDaysAmountInMonthOfYear(this.state.currentMonth, this.state.currentYear),
        firstMonth = this.state.currentMonth === this.props.from.month && this.state.currentYear === this.props.from.year,
        lastMonth = this.state.currentMonth === this.props.to.month && this.state.currentYear === this.props.to.year,
        firstDay = firstMonth ? this.props.from.day : 1,
        lastDay = lastMonth ? this.props.to.day : thisMonthDayCount,
        bookings = this.returnThisMonthBookings( 
          this.props.bookings,
          this.state.currentMonth,
          this.state.currentYear,
          firstDay,
          lastDay
        ),
        controlPanelHeader,
        i;

    if (this.props.show) {
      let targetParams = this.props.target.getBoundingClientRect();
      style = {
        display: '',
        top: targetParams.top,
        left: targetParams.right
      }
    } else {
      style = {
        display: 'none'
      }
    }
    if (this.props.from.year === this.props.to.year) {
      controlPanelHeader = <p>{this.state.currentYear}</p>;
    } else {
      controlPanelHeader = <button className="calendar-control-panel-choose-year" onClick={this.showYearPanel}>{this.state.currentYear}</button>;
    }
    if (firstMonth) {
      firstButtonClassName += ' disabled';
    } 
    if (lastMonth) {
      secondButtonClassName += ' disabled';
    }
    for (i = 0; i < 7; i += 1) {
      dayBricks.push(
        <div key={`week${i}`} className="day-brick day-of-week">
          {weekDays[i]}
        </div>
      );
    }
    for (i = 0; i < weekDayOfMonth; i += 1) {
      dayBricks.push(
        <div key={`other${lastMonthDayCount + i - weekDayOfMonth}`} className="day-brick other-month">
          {lastMonthDayCount + i + 1 - weekDayOfMonth}
        </div>
      );
    }
    for (i = 0; i < firstDay - 1; i += 1) {
      dayBricks.push(
        <div key={i} className="day-brick unavailable">
          {i + 1}
        </div>
      );
    }
    while (bookings.length > 0) {
      if (bookings[0].from.month === this.state.currentMonth) {
        for (i; i < bookings[0].from.day - 1; i += 1) {
          dayBricks.push(
            <div key={i} className="day-brick available">
              {i + 1}
            </div> 
          );
        }
      }
      let limit = (bookings[0].to.month !== this.state.currentMonth || bookings[0].to.day > lastDay) ? lastDay : bookings[0].to.day - 1;
      for (i; i < limit; i += 1) {
        dayBricks.push(
          <div key={i} className="day-brick booked">
            {i + 1}
          </div> 
        );
      }
      bookings.shift();
    }
    for (i; i < lastDay; i += 1) {
      dayBricks.push(
        <div key={i} className="day-brick available">
          {i + 1}
        </div> 
      );
    }
    for (i; i < thisMonthDayCount; i += 1) {
      dayBricks.push(
        <div key={i} className="day-brick unavailable">
          {i + 1}
        </div> 
      );
    }

    weekDayOfMonth = (weekDayOfMonth + thisMonthDayCount + 6) % 7 + 1;

    for (i = 0; i < 7 - weekDayOfMonth; i += 1) {
      dayBricks.push(
        <div key={`other${i}`} className = "day-brick other-month">
          {i + 1}
        </div>
      );
    }

    return (
      <div className="calendar" style={style}>
        <div className="calendar-control-panel">
          <button type="button" className="calendar-control-panel-info" onClick={this.toggleInfo}>
            <i className="far fa-question-circle" />
          </button>
          {controlPanelHeader}
          <button type="button" className="calendar-control-panel-close" onClick={this.props.parentClass.showCalendar}>
            <i className="far fa-times-circle" />
          </button>
        </div>
        <div className="calendar-header">
          <button type="button" className={firstButtonClassName} onClick={this.switchMonth}>
            <i className="fas fa-caret-left" />
          </button>
          <h3 className="calendar-header-header">
            {this.props.convertNumberToMonth[this.state.currentMonth]}
          </h3>
          <button type="button" className={secondButtonClassName} onClick={this.switchMonth}>
            <i className="fas fa-caret-right" />
          </button>
        </div>
        <div className="calendar-body">
          {dayBricks}
        </div>
        <div className="calendar-info">
          <div className="calendar-info-day-bricks">
            <div className="day-brick available">
              5
            </div>
            <p>
              Доступно
            </p>
            <div className="day-brick booked">
              2
            </div>
            <p>
              Занято
            </p>
            <div className="day-brick unavailable">
              13
            </div>
            <p>
              Недоступно
            </p>
            <div className="day-brick other-month">
              27
            </div>
            <p>
              Другой месяц
            </p>
          </div>
          <p>
            Обратите внимание, что календарь синхронизирован с серверным временем (МСК), так что возможны расхождения дат с локальным временем.
          </p>
        </div>
      </div>
    )
  }
}