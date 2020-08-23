import {
  incrementDate,
  getDaysAmountInMonthOfYear,
  dateSmaller
} from "../libraries/dates";

import "../public/styles/components/chooseDate.scss";

export default class extends React.Component {
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

class Calendar extends React.Component {
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

  getFirstBooking(bookings, start, forwards) {
    if (bookings.length > 0) {
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
    return false;
  }

  returnThisMonthBookings(bookings, month, year, from, to) {
    if (0 === bookings.length) return [];

    let result = [],
        i = 0;

    from = {
      year: this.state.currentYear,
      month: this.state.currentMonth,
      day: from
    };

    to = {
      year: this.state.currentYear,
      month: this.state.currentMonth,
      day: to
    };

    while(dateSmaller(bookings[i].to, from)) {
      if (++i === bookings.length) return [];
    }

    while (dateSmaller(bookings[i].from, to, false)) {
      result.push(bookings[i]);
      if (++i === bookings.length) return result;
    }

    return result;
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
        dataSent: false,
        provoker: null,
        from,
        to
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
            to.day = getDaysAmountInMonthOfYear(to.month, to.year);
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
          dataSent: false,
          provoker: this.props.target.nextElementSibling,
          from,
          to: null
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
          dataSent: false,
          provoker: this.props.target.previousElementSibling,
          from: null,
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

  isDayAvailable(bookings, day) {
    if (bookings.length > 0) {
      let i = 0;
      if (bookings[i].from.month !== this.state.currentMonth) {
        if (bookings[i].to.month !== this.state.currentMonth || day < bookings[i].to.day) {
          return false;
        }

        i += 1;
      }

      for (i; i < bookings.length - 1; i += 1) {
        if (bookings[i].from.day <= day && bookings[i].to.day > day) {
          return false;
        }
      }

      if (i < bookings.length) {
        if (bookings[i].to.month !== this.state.currentMonth) {
          return !(bookings[i].from.day <= day);
        }

        return !(bookings[i].from.day <= day && bookings[i].to.day > day);
      }
    }

    return true;
  }

  render() {
    let from, to, currentMonth, currentYear, style, bookingEndMode = false;
    if (this.props.show) {
      if (this.props.target.classList[0] === 'to') {
        bookingEndMode = true;
        from = incrementDate(this.state.from, getDaysAmountInMonthOfYear(this.state.from.month, this.state.from.year));
        to = incrementDate(this.state.to, getDaysAmountInMonthOfYear(this.state.to.month, this.state.to.year));

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

      let ratio = window.innerWidth / window.innerHeight;

      if (ratio > 1 && ratio < 2.33) {
        let targetParams = this.props.target.getBoundingClientRect(),
            rem = window.innerWidth / 100 + window.innerHeight / 100,
            top,
            left,
            translateX,
            translateY;

        targetParams = {
          top: targetParams.top + 
            (window.pageYOffset || document.documentElement.scrollTop),
          bottom: targetParams.bottom +
            (window.pageYOffset || document.documentElement.scrollTop),
          left: targetParams.left +
            (window.pageYOffset || document.documentElement.scrollLeft),
          right: targetParams.right + 
            (window.pageXOffset || document.documentElement.scrollLeft)
        }

        if (targetParams.right < 14 * rem) {
          left = targetParams.left;
          translateX = '0';
        } else {
          left = targetParams.right;
          translateX = '-100%';
        }

        if (targetParams.top < 14 * rem) {
          top = targetParams.bottom;
          translateY = '1rem';
        } else {
          top = targetParams.top - rem;
          translateY = '-100%';
        }

        style = {
          display: '',
          transform: `translate(${translateX}, ${translateY})`,
          top,
          left
        }
      } else {
        style = {
          display: ''
        }
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
        weekDayOfMonth = ((new Date(this.state.currentYear, this.state.currentMonth - 1, 1).getDay()) + 6) % 7,
        lastMonthDayCount = getDaysAmountInMonthOfYear(this.state.currentMonth === 1 ? 12 : this.state.currentMonth - 1, this.state.currentYear),
        thisMonthDayCount = getDaysAmountInMonthOfYear(this.state.currentMonth, this.state.currentYear),
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
      if (bookings.length > 0) {
        bookings[0].from = incrementDate(
          bookings[0].from,
          getDaysAmountInMonthOfYear(bookings[0].from.month, bookings[0].from.year)
        );
        bookings[0].to = incrementDate(
          bookings[0].to,
          getDaysAmountInMonthOfYear(bookings[0].to.month, bookings[0].to.year)
        );
      }

      let i = 1;

      for (i; i < bookings.length - 1; i += 1) {
        bookings[i].from = incrementDate(
          bookings[i].from,
          thisMonthDayCount
        );
        bookings[i].to = incrementDate(
          bookings[i].to,
          thisMonthDayCount
        );
      }
      if (i < bookings.length) {
        bookings[i].from = incrementDate(
          bookings[i].from,
          thisMonthDayCount
        );
        bookings[i].to = incrementDate(
          bookings[i].to,
          getDaysAmountInMonthOfYear(bookings[i].to.month, bookings[i].to.year)
        );
      }
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
            <div
              key={i}
              className="day-brick available"
              onClick={this.chooseSecondDay}
              onMouseEnter={this.highlightChoices}
              onMouseLeave={this.unhighlightChoices}
            >
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
      for (i = firstDay - 1; i < lastDay; i += 1) {
        if (this.isDayAvailable(bookings, i + 1)) {
          dayBricks.push(
            <div
              key={i}
              className="day-brick available"
              onClick={this.chooseSecondDay}
            >
              {i + 1}
            </div> 
          );
        } else {
          dayBricks.push(
            <div key={i} className="day-brick booked">
              {i + 1}
            </div> 
          );
        }
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