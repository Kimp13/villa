import React from "react";

import "../public/styles/components/calendar.module.scss";

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMonth: this.props.from.month,
      currentYear: this.props.from.year,
      from: this.props.from,
      to: this.props.to,
      chooseMode: false
    }

    this.switchMonth = this.switchMonth.bind(this);
    this.chooseSecondDay = this.chooseSecondDay.bind(this);
    this.highlightChoices = this.highlightChoices.bind(this);
  }

  incrementDate(date, monthDaysCount) {
    if (date.day === monthDaysCount) {
      if (date.month === 12) {
        return {
          year: date.year + 1,
          month: 1,
          day: 1
        }
      }
      return {
        year: date.year,
        month: date.month + 1,
        day: 1
      }
    }
    return {
      year: date.year,
      month: date.month,
      day: date.day + 1
    }
  }

  getDaysAmountInMonthOfYear(month, year) {
    let isYearLeap = false;
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      isYearLeap = true;
    }
    if (month < 8) {
      if (month === 2) {
        return isYearLeap ? 29 : 28;
      }
      return 30 + month % 2;
    }
    return 30 + (month - 1) % 2;
  }

  getFirstBooking(bookings, start, forwards) {
    let i;
    if (forwards) {
      i = 0;
      while (bookings[i].from.year < start.year) {
        if (++i === bookings.length) return false;
      }
      if (bookings[i].from.year !== start.year) return bookings[i];
      while (bookings[i].from.month < start.month) {
        if (++i === bookings.length) return false;
      }
      if (bookings[i].from.month !== start.month) return bookings[i];
      while (bookings[i].from.day < start.day) {
        if (++i === bookings.length) return false;
      }
      return bookings[i];
    }
    i = bookings.length - 1;
    while (bookings[i].to.year > start.year) {
      if (i-- === 0) return false;
    }
    if (bookings[i].to.year !== start.year) return bookings[i];
    while (bookings[i].to.month > start.month) {
      if (i-- === 0) return false;
    }
    if (bookings[i].to.month !== start.month) return bookings[i];
    while (bookings[i].to.day > start.day) {
      if (i-- === 0) return false;
    }
    return bookings[i];
  }

  returnThisMonthBookings(bookings, month, year, from, to) {
    function dateSmallerNonStrict(first, second) {
      if (first.year < second.year) {
        return true;
      }

      if (first.year === second.year) {
        if (first.month < second.month) {
          return true;
        }

        return (first.month === second.month && first.day <= second.day);
      }

      return false;
    }

    function mergeBookings(arr) {
      const length = arr.length;
      let i, result = new Array();

      for (i = 0; i < length; i += 1) {
        let itemToPush = arr[i];

        while (i + 1 < length && dateSmallerNonStrict(arr[i], arr[i + 1])) {
          i += 1;
          itemToPush.to.year = arr[i].to.year;
          itemToPush.to.month = arr[i].to.month;
          itemToPush.to.day = arr[i].to.day;
        }

        result.push(itemToPush);
      }

      return result;
    }

    let result = [],
        i = 0;
    if (i === bookings.length) return [];
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
    if (i === bookings.length) return mergeBookings(result);
    while (bookings[i].from.month === month && bookings[i].from.day <= to) {
      result.push(bookings[i]);
      i += 1;
      if (i === bookings.length) return mergeBookings(result);
    }
    return mergeBookings(result);
  }

  switchMonth(event) {
    let target = event.target, newState;
    while (target.nodeName !== 'BUTTON') {
      target = target.parentNode;
    }
    if (target.classList.length === 1) {
      if (target.classList[0].substring(16) === 'next') {
        if (this.state.currentMonth === 12) {
          newState = {
            currentMonth: 1,
            currentYear: this.state.currentYear + 1
          };
        } else {
          newState = {
            currentMonth: this.state.currentMonth + 1,
            currentYear: this.state.currentYear
          };
        }
      } else {
        if (this.state.currentMonth === 1) {
          newState = {
            currentMonth: 12,
            currentYear: this.state.currentYear - 1
          };
        } else {
          newState = {
            currentMonth: this.state.currentMonth - 1,
            currentYear: this.state.currentYear
          };
        }
      }
    }
    this.setState({
      ...newState,
      from: this.state.from,
      to: this.state.to,
      chooseMode: this.state.chooseMode
    });
  }

  getPrice(from, to) {
    let getDatePrices = (day, month) => {
      if ((dates[0].month > month) || (dates[0].month === month && dates[0].day >= day)) {
        return this.props.parentClass.props.priceInfo[dateStrings[dates.length - 1]].slice();
      }

      for (let i = 1; i < dates.length; i += 1) {
        if ((dates[i].month > month) || (dates[i].month === month && dates[i].day > day)) {
          return this.props.parentClass.props.priceInfo[dateStrings[i - 1]].slice();
        }
      }

      return this.props.parentClass.props.priceInfo[dateStrings[dates.length - 1]].slice();
    },
        dates = new Array(),
        dateStrings = Object.keys(this.props.parentClass.props.priceInfo);

    if (this.props.parentClass.props.priceInfo) {
      let previousMonth = from.month,
          previousMonthDayCount = this.getDaysAmountInMonthOfYear(from.month, from.year),
          prices,
          newPrices;

      for (let i = 0; i < dateStrings.length; i += 1) {
        dates.push({
          day: parseInt(dateStrings[i].substring(0, 2)),
          month: parseInt(dateStrings[i].substring(3))
        });
      }

      prices = getDatePrices(from.day, from.month);

      from = this.incrementDate(from, previousMonthDayCount);

      while (from.year < to.year) {
        if (from.month !== previousMonth) {
          previousMonth = from.month;
          previousMonthDayCount = this.getDaysAmountInMonthOfYear(from.month, from.year);
        }

        newPrices = getDatePrices(from.day, from.month);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = this.incrementDate(from, previousMonthDayCount);
      }

      while (from.month < to.month) {
        if (from.month !== previousMonth) {
          previousMonth = from.month;
          previousMonthDayCount = this.getDaysAmountInMonthOfYear(from.month, from.year);
        }

        newPrices = getDatePrices(from.day, from.month);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = this.incrementDate(from, previousMonthDayCount);
      }

      previousMonth = from.month;
      previousMonthDayCount = this.getDaysAmountInMonthOfYear(from.month, from.year);

      while (from.day < to.day) {
        newPrices = getDatePrices(from.day, from.month);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = this.incrementDate(from, previousMonthDayCount);
      }

      return prices;
    }

    return null;
  }

  chooseSecondDay(event) {
    let day = parseInt(event.target.innerHTML), newState = {
      currentMonth: this.state.currentMonth,
      currentYear: this.state.currentYear
    }

    if (this.state.chooseMode) {
      let from, to;

      if (this.props.target.classList[0] === 'from') {
        from = {
          day,
          month: this.state.currentMonth,
          year: this.state.currentYear
        };
        to = this.props.parentClass.state.to;
      } else {
        to = {
          day,
          month: this.state.currentMonth,
          year: this.state.currentYear
        };
        from = this.props.parentClass.state.from;
      }

      this.props.parentClass.setState({
        calendarShown: false,
        provoker: null,
        from,
        to,
        price: this.getPrice(from, to)
      });

      this.state = {
        currentMonth: this.props.from.month,
        currentYear: this.props.from.year,
        from: this.props.from,
        to: this.props.to,
        chooseMode: false
      }

      this.unhighlightChoices();
    } else {
      if (this.props.target.classList[0] === 'from') {
        let from = {
          day: day,
          month: newState.currentMonth,
          year: newState.currentYear
        },
            to,
            firstBooking = this.getFirstBooking(this.props.bookings, from, true);

        if (firstBooking) {
          to = {...(firstBooking.to)};
          if (firstBooking.from.month !== to.month || firstBooking.from.year !== to.year) {
            to.year = firstBooking.from.year;
            to.month = firstBooking.from.month;
            to.day = this.getDaysAmountInMonthOfYear(to.month, to.year);
          }
          if (to.year === this.state.to.year && to.month === this.state.to.month && from.day < this.state.to.day) {
            to.day = this.state.to.day;
          }
          to.day -= 1;
        } else {
          to = this.state.to;
        }

        this.setState({
          ...newState,
          from: from,
          to: to,
          chooseMode: true,
          divideDay: firstBooking ? firstBooking.from.day : false
        });

        this.props.parentClass.setState({
          calendarShown: true,
          provoker: this.props.target.nextElementSibling,
          from
        });
      } else {
        let to = {
          day: day,
          month: newState.currentMonth,
          year: newState.currentYear
        },
            from,
            firstBooking = this.getFirstBooking(this.props.bookings, to, false);
        if (firstBooking) {
          from = {...(firstBooking.from)}
          if (from.month !== firstBooking.to.month || from.year !== firstBooking.to.year) {
            from.year = firstBooking.to.year;
            from.month = firstBooking.to.month;
            from.day = 1;
          }
          if (from.year === this.state.from.year && from.month === this.state.from.month && from.day < this.state.from.day) {
            from.day = this.state.from.day;
          }
        } else {
          from = this.state.from;
        }
        this.setState({
          ...newState,
          to: to,
          from: from,
          chooseMode: true,
          divideDay: firstBooking ? firstBooking.to.day : 0
        });
        this.props.parentClass.setState({
          calendarShown: true,
          provoker: this.props.target.previousElementSibling,
          to
        });
      }
    }
  }

  unhighlightChoices() {
    let availableDays = document.getElementsByClassName('available');
    for (let day of availableDays) {
      if (day.classList.contains('chosen')) {
        day.classList.remove('chosen');
      }
    }
  }

  highlightChoices(event) {
    let availableDays = document.getElementsByClassName('available'),
        day = event.target.innerHTML,
        i;
    if (this.props.target.classList[0] === 'to') {
      for (i = 0; availableDays[i].innerHTML !== day; i += 1) {
        availableDays[i].classList.add('chosen');
      }
    } else {
      for (i = availableDays.length - 1; availableDays[i].innerHTML !== day; i -= 1) {
        availableDays[i].classList.add('chosen');
      }
    }
    availableDays[i].classList.add('chosen');
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
    let from, to, currentMonth, currentYear, style, bookingEndMode = false;
    if (this.props.show) {
      if (this.props.target.classList[0] === 'to') {
        bookingEndMode = true;
        from = this.incrementDate(this.state.from, this.getDaysAmountInMonthOfYear(this.state.from.month, this.state.from.year));
        to = this.incrementDate(this.state.to, this.getDaysAmountInMonthOfYear(this.state.to.month, this.state.to.year));

        if (this.state.currentYear < from.year) {
          this.state.currentYear += 1;
          this.state.currentMonth = 1;
        } else if (from.year === this.state.currentYear && this.state.currentMonth < from.month) {
          this.state.currentMonth += 1;
        }
      } else {
        from = this.state.from;
        to = this.state.to;
      }

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
      this.state.from = this.props.from;
      this.state.to = this.props.to;
      this.state.chooseMode = false;
      from = this.state.from;
      to = this.state.to;
    }
    let firstButtonClassName = 'calendar-header-previous',
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
        lastMonthDayCount = this.getDaysAmountInMonthOfYear(this.state.currentMonth === 1 ? 12 : this.state.currentMonth - 1, this.state.currentYear),
        thisMonthDayCount = this.getDaysAmountInMonthOfYear(this.state.currentMonth, this.state.currentYear),
        firstMonth = (this.state.currentMonth === from.month && this.state.currentYear === from.year),
        lastMonth = (this.state.currentMonth === to.month && this.state.currentYear === to.year),
        firstDay = firstMonth ? from.day : 1,
        lastDay = lastMonth ? to.day : thisMonthDayCount,
        bookings = this.returnThisMonthBookings( 
          this.props.bookings,
          this.state.currentMonth,
          this.state.currentYear,
          firstDay,
          lastDay
        ),
        controlPanelHeader,
        i;
    if (bookingEndMode) {
      bookings = bookings.map(booking => {
        return {
          from: this.incrementDate(booking.from, this.getDaysAmountInMonthOfYear(booking.from.month, booking.from.year)),
          to: this.incrementDate(booking.to, this.getDaysAmountInMonthOfYear(booking.to.month, booking.to.year))
        }
      });
    }
    if (from.year === to.year) {
      controlPanelHeader = <p>{this.state.currentYear}</p>;
    } else {
      controlPanelHeader = <button type="button" className="calendar-control-panel-choose-year" onClick={this.showYearPanel}>{this.state.currentYear}</button>;
    }
    if (firstMonth) {
      firstButtonClassName += ' disabled';
    } 
    if (lastMonth) {
      secondButtonClassName += ' disabled';
    }
    for (i = 0; i < 7; i += 1) {
      dayBricks.push(
        <div key={weekDays[i]} className="day-brick day-of-week">
          {weekDays[i]}
        </div>
      );
    }
    for (i = 0; i < weekDayOfMonth; i += 1) {
      let day = lastMonthDayCount + i + 1 - weekDayOfMonth;
      dayBricks.push(
        <div key={-day} className="day-brick other-month">
          {day}
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
    if (this.state.chooseMode) {
      let bookingForwards = true;

      if (this.props.target.classList[0] === 'to') {
        if (firstMonth && from.day > 1) {
          dayBricks.pop();
          dayBricks.push(
            <div key={'chosen'} className="day-brick chosen">
              {i}
            </div>
          );
        }

        for (i;
          i < ((lastMonth && this.state.divideDay) ?
          this.state.divideDay :
          lastDay);
          i += 1) {
          dayBricks.push(
            <div key={i} className="day-brick available" onClick={this.chooseSecondDay} onMouseEnter={this.highlightChoices} onMouseLeave={this.unhighlightChoices}>
              {i + 1}
            </div>
          );
        }
        for (i; i < lastDay; i += 1) {
          dayBricks.push(
            <div key={i} className="day-brick booked">
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
      } else {
        for (i; i < (firstMonth ? this.state.divideDay - 1 : 0); i += 1) {
          dayBricks.push(
            <div key={i} className="day-brick booked">
              {i + 1}
            </div>
          );
        }
        for (i; i < lastDay; i += 1) {
          dayBricks.push(
            <div key={i} className="day-brick available" onClick={this.chooseSecondDay} onMouseEnter={this.highlightChoices} onMouseLeave={this.unhighlightChoices}>
              {i + 1}
            </div>
          );
        }
        if (lastMonth) {
          dayBricks.pop();
          dayBricks.push(
            <div key={'chosen'} className="day-brick chosen">
              {i}
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
      }
    } else {
      while (bookings.length > 0) {
        if (bookings[0].from.month === this.state.currentMonth) {
          for (i; i < bookings[0].from.day - 1; i += 1) {
            dayBricks.push(
              <div key={i} className="day-brick available" onClick={this.chooseSecondDay}>
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
          <div key={i} className="day-brick available" onClick={this.chooseSecondDay}>
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
    }

    weekDayOfMonth = (weekDayOfMonth + thisMonthDayCount + 6) % 7 + 1;

    for (i = 0; i < 7 - weekDayOfMonth; i += 1) {
      let day = i + 1;
      dayBricks.push(
        <div key={-day} className = "day-brick other-month">
          {day}
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
            {this.props.convertNumberToMonth[this.state.currentMonth - 1]}
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