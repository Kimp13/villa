import { useState } from "react";
import {
  incrementDate,
  decrementDate,
  dateSmaller,
  dateBigger,
  getDaysAmountInMonthOfYear
} from "../../libraries/dates";
import { getDatePrices } from "../../libraries/prices";
import { getApiResponse, getFullLink } from "../../libraries/requests";
import { getCookie } from "../../libraries/cookies";

import IntroductionDiv from "../../components/IntroductionDiv";
import ChooseDate from "../../components/ChooseDate";
import Loader from "../../components/Loader";

import "../../public/styles/pages/room.scss";

export async function getStaticPaths () {
  const rooms = await getApiResponse('/rooms', {_sort: 'id:asc'});

  let paths = new Array();

  for (let i = 1; i < rooms.length; i += 1) {
    paths.push({params: {name: rooms[i].name}});
  }

  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps ({ params }) {
  const room = await getApiResponse('/rooms', {name: params.name});

  return {
    props: {
      room: room[0],
      title: room[0].name
    }
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      room: props.room,
      time: null,
      bookings: null,
      gotValues: false
    }
  }

  setPI(priceInfo) {
    this.setState((state, props) => {
      state.room.priceInfo = priceInfo;

      return state;
    });
  }

  render() {
    if (this.state.time && this.state.bookings) {
      let todate = new Date(this.state.time),
          from = {
            day: todate.getDate(),
            month: todate.getMonth() + 1,
            year: todate.getFullYear()
          },
          to;

      todate.setTime(todate.getTime() + 8640000000);

      to = {
        day: todate.getDate(),
        month: todate.getMonth() + 1,
        year: todate.getFullYear()
      };

      return (
        <React.Fragment>
          <IntroductionDiv content={this.state.room} />
          { 
            this.props.socket.user.isRoot ?
            <AdminRoomPanel
              user={this.props.socket.user}
              bookings={this.state.bookings}
              priceInfo={this.state.room.priceInfo}
              setPI={this.setPI}
              roomId={this.state.room.id}
              from={from}
            /> :
            <BookRoom
              user={this.props.socket.user}
              bookings={this.state.bookings}
              priceInfo={this.state.room.priceInfo}
              roomId={this.state.room.id}
              from={from}
              to={to}
            />
          }
        </React.Fragment>
      );
    } else if (this.state.gotValues) {
      return <h2 style={{textAlign:'center'}}>К сожалению, произошла ошибка.</h2>;
    } else {
      if (this.props.socket.user) {
        Promise.all([
          getApiResponse('/getTime'),
          getApiResponse(
            '/villa-user-management/getBookings', {
              roomId: this.props.room.id
            },
            this.props.socket.user.isRoot ?
              'Bearer ' + getCookie('jwt') :
              null
          )
        ])
          .then(values => {
            for (let value of values) {
              if (value.statusCode >= 400) {
                state.gotValues = true;
                return state;
              }
            }

            this.setState((state, props) => {
              state.time = values[0].time;
              state.bookings = values[1];
              state.gotValues = true;

              return state;
            });
          }, es => {
            console.log(es);
          });
      }

      return <Loader />;
    }
  }
}

class BookRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      from: null,
      to: null,
    }

    this.book = this.book.bind(this);
    this.getData = this.getData.bind(this);
  }

  countPrice(from, to) {
    if (this.props.priceInfo) {
      let previousMonth = from.month,
          previousMonthDayCount = getDaysAmountInMonthOfYear(from.month, from.year),
          prices,
          newPrices;

      prices = getDatePrices(from, this.props.priceInfo);
      from = incrementDate(from, previousMonthDayCount);

      while (from.year < to.year) {
        if (from.month !== previousMonth) {
          previousMonth = from.month;
          previousMonthDayCount = getDaysAmountInMonthOfYear(from.month, from.year);
        }

        newPrices = getDatePrices(from, this.props.priceInfo);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = incrementDate(from, previousMonthDayCount);
      }
      while (from.month < to.month) {
        if (from.month !== previousMonth) {
          previousMonth = from.month;
          previousMonthDayCount = getDaysAmountInMonthOfYear(from.month, from.year);
        }

        newPrices = getDatePrices(from, this.props.priceInfo);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = incrementDate(from, previousMonthDayCount);
      }

      previousMonth = from.month;
      previousMonthDayCount = getDaysAmountInMonthOfYear(from.month, from.year);

      while (from.day < to.day) {
        newPrices = getDatePrices(from, this.props.priceInfo);

        for (let i = 0; i < prices.length; i += 1) {
          prices[i] += newPrices[i];
        }

        from = incrementDate(from, previousMonthDayCount);
      }

      return prices;
    }

    return null;
  }

  createPrices() {
    if (this.state.from && this.state.to) {
      let price = this.countPrice(this.state.from, this.state.to);
      let head = (
            <tr key="0">
              <th key="0">Количество<br/>гостей</th>
              <th key="1">Цена</th>
            </tr>
          ),
          body = new Array();

      for (let i = 0; i < price.length; i += 1) {
        body.push(
          <tr key={i + 1}>
            <td key="0">{i + 1}</td>
            <td key="1">{price[i]}</td>
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

  book(event) {
    event.preventDefault();
    if (this.props.user.isAuthenticated) {
      this.setState((state, props) => {
        state.loading = true;

        getApiResponse('/villa-user-management/newRequest', {
          booking: `${this.props.roomId}` + 
            `_${this.state.from.day}.${this.state.from.month}.${this.state.from.year}` +
            `_${this.state.to.day}.${this.state.to.month}.${this.state.to.year}`
        }, getCookie('jwt') || getCookie('jwta'))
          .then(res => {
            if (res.ok) {
              window.location.href = '/messages';
            } else {
              this.setState((state, props) => {
                if (res.statusCode === 403) {
                  state.errorMessage = "Вы уже подали заявку на бронирование. " +
                    "Дождитесь решения её судьбы.";
                } else {
                  state.errorMessage = "К сожалению, произошла ошибка. Попробуйте позже " +
                    "или обратитесь к администрации.";
                }
                state.loading = false;

                return state;
              });
            }
          })

        return state;
      });
    } else {
      window.localStorage.setItem('firstBooking',
        `${this.props.roomId}` + 
        `_${this.state.from.day}.${this.state.from.month}.${this.state.from.year}` +
        `_${this.state.to.day}.${this.state.to.month}.${this.state.to.year}`
      );

      window.location.href = '/messages/welcome';
    }
  }

  getData(from, to) {
    this.setState((state, props) => {
      state.from = from;
      state.to = to;

      return state;
    });
  }

  render() {
    let submitButton, component;

    if (this.state.loading) {
      component = <Loader />;
    } else if (this.state.errorMessage) {
      component = (
        <p className="book-room-error">
          {this.state.errorMessage}
        </p>
      );
    } else {
      component = (
        <form className="flex-book-form">
          <ChooseDate
            bookings={this.props.bookings}
            from={this.props.from}
            to={this.props.to}
            setData={this.getData}
          />
          {
            this.state.from && this.state.to ?
            <input
              type="submit"
              className="date-submit"
              value="Забронировать"
              onClick={this.book}
            /> : null
          }
        </form>
      );
    }

    return (
      <div className="content-flex-wrapper">
        <div className="book-room">
          <h2>
            Забронировать
          </h2>
          {component}
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

class AdminRoomPanel extends React.Component {
  constructor(props) {
    super(props);

    let date = new Date(Date.now() - 15552000000),
        from = {
          day: 1,
          month: date.getMonth() + 1,
          year: date.getFullYear()
        },
        to,
        chosenFrom;

    date.setTime(Date.now() + 31104000000);

    to = {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };

    to.day = getDaysAmountInMonthOfYear(to.month, to.year);

    date.setTime(Date.now());

    chosenFrom = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };

    this.state = {
      from,
      to,
      chosenFrom,
      chosenTo: chosenFrom,
      currentMonth: props.from.month,
      currentYear: props.from.year,
      prices: Object.assign({}, props.priceInfo),
      multipleChoice: false,
      pricesSet: false
    };
    this.indexToMonth = [
      'bloop',
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
    this.update = prices => {
      console.log('Hello!');
      let elements = document
        .getElementsByClassName('admin-room-panel-prices-field');

      for (let i = 0; i < elements.length; i += 1) {
        elements.children[1].value = prices[i];
      }
    }

    this.switchMonth = this.switchMonth.bind(this);
    this.toggleMultiple = this.toggleMultiple.bind(this);
    this.chooseDate = this.chooseDate.bind(this);
    this.highlightChoices = this.highlightChoices.bind(this);
    this.unhighlightChoices = this.unhighlightChoices.bind(this);
    this.filterInput = this.filterInput.bind(this);
    this.resetPrices = this.resetPrices.bind(this);
    this.submitPrices = this.submitPrices.bind(this);
  }

  switchMonth(event) {
    let target;

    for (
      target = event.target;
      target.nodeName !== 'BUTTON';
      target = target.parentNode
    );

    this.setState((state, props) => {
      if (target.nextSibling) {
        if (state.currentMonth === 1) {
          state.currentMonth = 12;
          state.currentYear -= 1;
        } else {
          state.currentMonth -= 1;
        }
      } else {
        if (state.currentMonth === 12) {
          state.currentMonth = 1;
          state.currentYear += 1;
        } else {
          state.currentMonth += 1;
        }
      }

      return state;
    });
  }

  toggleMultiple() {
    this.setState((state, props) => {
      if (state.multipleChoice) {
        state.multipleChoice = false;
        state.chosenTo = state.chosenFrom;
      } else {
        state.multipleChoice = true;
      }

      return state;
    });
  }

  labelFunction(event) {
    event.target.nextElementSibling.focus();
  }

  dateChosen(day) {
    let date = {
      day,
      month: this.state.currentMonth,
      year: this.state.currentYear
    };

    return (
      dateBigger(date, this.state.chosenFrom, false) &&
      dateSmaller(date, this.state.chosenTo, false)
    );
  }

  chooseDate(event) {
    let day = Number(event.target.innerHTML);

    this.setState((state, props) => {
      if (state.multipleChoice) {
        let date = {
          day,
          month: state.currentMonth,
          year: state.currentYear
        };

        if (dateSmaller(date, state.chosenFrom)) {
          state.chosenFrom = date;
        } else {
          state.chosenTo = date;
        }

        return state;
      } else {
        state.chosenFrom = {
          day: day,
          month: this.state.currentMonth,
          year: this.state.currentYear
        };
        state.chosenTo = state.chosenFrom;
      }

      return state;
    });
  }

  highlightChoices(event) {
    let day = Number(event.target.innerHTML);

    let parent = document
      .getElementsByClassName('admin-room-panel-calendar-content')[0];

    if (
      this.state.currentMonth === this.state.chosenFrom.month &&
      day < this.state.chosenFrom.day
    ) {
      let element = parent
            .querySelector('.available + .chosen')
            .previousElementSibling,
          elementDay = Number(element.innerHTML);

      for (day; day < elementDay; day += 1) {
        element.classList.add('chosen');
        element.classList.remove('available');
        element = element.previousElementSibling;
      }
    } else if (this.state.currentMonth === this.state.chosenTo.month) {
      let element = parent
            .querySelector('.chosen + .available'),
          elementDay = Number(element.innerHTML);

      for (day; day > elementDay; day -= 1) {
        element.classList.add('chosen');
        element.classList.remove('available');
        element = element.nextElementSibling;
      }
    } else {
      let date = {
            day,
            month: this.state.currentMonth,
            year: this.state.currentYear
          },
          elements = parent.querySelectorAll('.available');

      if (dateSmaller(date, this.state.chosenFrom)) {
        for (let i = day; i < elements.length; i += 1) {
          elements[i].classList.add('chosen');
          elements[i].classList.remove('available');
        }
      } else {
        day -= 1;
        for (let i = 0; i < day; i += 1) {
          elements[i].classList.add('chosen');
          elements[i].classList.remove('available');
        }
      }
    }
  }

  unhighlightChoices(event) {
    let day = Number(event.target.innerHTML);

    let parent = document
      .getElementsByClassName('admin-room-panel-calendar-content')[0];

    if (
      this.state.currentMonth === this.state.chosenFrom.month &&
      day < this.state.chosenFrom.day
    ) {
      let element = parent.querySelector('.available + .chosen');

      for (day += 1; day < this.state.chosenFrom.day; day += 1) {
        element.classList.remove('chosen');
        element.classList.add('available');
        element = element.nextElementSibling;
      }
    } else if (this.state.currentMonth === this.state.chosenTo.month) {
      let element = parent.querySelector('.chosen + .available');

      for (day -= 1; day > this.state.chosenTo.day; day -= 1) {
        element = element.previousElementSibling;
        element.classList.remove('chosen');
        element.classList.add('available');
      }
    } else {
      let elements = parent.querySelectorAll('.chosen');

      for (let i = 0; i < elements.length; i += 1) {
        elements[i].classList.remove('chosen');
        elements[i].classList.add('available');
      }
    }
  }

  createDay(options, inner, bookings = false) {
    inner = Number(inner) || inner;

    let indicators = new Array();

    if (bookings) {
      let currentDate = {
            day: inner,
            month: this.state.currentMonth,
            year: this.state.currentYear
          },
          i = 0;
      
      while (
        dateSmaller(bookings[i].to, currentDate) &&
        ++i < bookings.length
      ) {}
      
      if (i !== bookings.length) {
        if (dateSmaller(bookings[i].to, currentDate, false)) {
          indicators.push(
            <div className="indicator" style={{'--color': '#f03'}} />
          );

          i += 1;
        }

        if (i !== bookings.length) {
          if (bookings[i].from.day === currentDate.day &&
            bookings[i].from.month === currentDate.month &&
            bookings[i].from.year === currentDate.year
          ) {
            indicators.push(
              <div className="indicator" style={{'--color': '#32cd32'}} />
            );
          }
        }
      }  
    }

    return ( 
      <div
        {...options}
      >
        {
          indicators.length > 0 ?
          <div className="indicators">
            {indicators}
          </div> :
          null
        }
        {inner}
      </div>
    );
  }

  filterInput(event) {
    let toString = date => {
      let key;

      if (date.day < 10) {
        key = '0' + String(date.day);
      } else {
        key = String(date.day);
      }

      key += '.'

      if (date.month < 10) {
        key += '0' + String(date.month);
      } else {
        key += String(date.month);
      }

      return key;
    }

    if (/^([1-9]\d*)?$/.test(event.target.value)) {
      let values = new Array(),
          field = event.target.parentNode.parentNode.firstChild;

      while (field.nodeName === 'DIV') {
        values.push(Number(field.children[1].value))
        field = field.nextElementSibling;
      }

      this.setState((state, props) => {
        let fromKey, toKey, to = incrementDate(state.chosenTo);

        // КОНЕЧНАЯ ТОЧКА
        toKey = toString(to);

        if (!state.prices.hasOwnProperty(toKey)) {
          state.prices[toKey] = getDatePrices(to, state.prices);
        }
        // КОНЕЧНАЯ ТОЧКА
        // ---------------
        // НАЧАЛЬНАЯ ТОЧКА
        fromKey = toString(state.chosenFrom);

        state.prices[fromKey] = values;
        // НАЧАЛЬНАЯ ТОЧКА
        // ---------------------------
        // УДАЛЕНИЕ ВСЕХ ПРОМЕЖУТОЧНЫХ
        to = decrementDate(to);
        toKey = toString(to);

        while (toKey !== fromKey) {
          if (state.prices.hasOwnProperty(toKey)) {
            delete state.prices[toKey];
          }
          to = decrementDate(to);
          toKey = toString(to);
        }
        // УДАЛЕНИЕ ВСЕХ ПРОМЕЖУТОЧНЫХ
        // -------------------------------------------
        // re-re-re-tu-tu-tu-rn-rn-rn
        state.pricesSet = true;
        return state;
        // Have you ever thought about a thing that every person's code has
        // their own unique things? I have, and that's fantastic.
      });
    }
  }

  resetPrices() {
    if (this.state.pricesSet) {
      this.setState((state, props) => {
        state.prices = Object.assign({}, props.priceInfo);
        return state;
      });
    }
  }

  submitPrices() {
    if (this.state.pricesSet) {
      fetch(getFullLink('/villa-user-management/updatePrices'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jwt: getCookie('jwt'),
          roomId: this.props.roomId,
          newPrices: this.state.prices
        })
      })
        .then(response => {
          if (response.ok) {
            this.setState((state, props) => {
              state.pricesSet = false;
              props.setPI(state.prices);

              return state;
            });
          } else {
            alert('Что-то пошло не так. Обратитесь сами знаете к кому.');
          }
        });
    }
  }

  render() {
    let weekDays = [
          'ПН',
          'ВТ',
          'СР',
          'ЧТ',
          'ПТ',
          'СБ',
          'ВС'
        ],
        isFirstMonth = (
          this.state.currentYear === this.state.from.year &&
          this.state.currentMonth === this.state.from.month
        ),
        isLastMonth = (
          this.state.currentYear === this.state.to.year &&
          this.state.currentMonth === this.state.to.month
        ),
        thisMonthDayCount = getDaysAmountInMonthOfYear(
          this.state.currentMonth,
          this.state.currentYear
        ),
        previousMonthDayCount = getDaysAmountInMonthOfYear(
          this.state.currentMonth === 1 ?
          12 : this.state.currentMonth,
          this.state.currentMonth === 1 ?
          this.state.currentYear - 1 :
          this.state.currentYear
        ),
        firstDay = isFirstMonth ? this.state.from.day : 1,
        lastDay = isLastMonth ? this.state.to.day : thisMonthDayCount,
        firstWeekDay = (new Date(
          this.state.currentYear,
          this.state.currentMonth - 1,
          1
        ).getDay() + 6) % 7,
        prices = getDatePrices(this.state.chosenFrom, this.state.prices),
        days = new Array(),
        i = new Number();

    for (i = 0; i < 7; i += 1) {
      days.push(
        this.createDay({
          className: 'weekday',
          key: `w${i}`
        }, weekDays[i])
      );
    }

    for (i = 0; i < firstWeekDay; i += 1) {
      let day = previousMonthDayCount - firstWeekDay + i + 1;
      days.push(
        this.createDay({
          className: 'other-month',
          key: `o${day}`
        }, day)
      );
    }

    for (i = 1; i < firstDay; i += 1) {
      days.push(
        this.createDay({
          className: 'unavailable',
          key: i
        }, i)
      );
    }

    for (i; i <= lastDay; i += 1) {
      if (this.dateChosen(i)) {
        days.push(
          this.createDay({
            className: 'chosen',
            key: i
          }, i, this.props.bookings)
        );
      } else {
        days.push(
          this.createDay({
            className: 'available',
            key: i,
            onClick: this.chooseDate,
            onMouseEnter: this.multipleChoice ? this.highlightChoices : null,
            onMouseLeave: this.multipleChoice ? this.unhighlightChoices : null
          }, i, this.props.bookings)
        );
      }
    }

    for (i; i <= thisMonthDayCount; i += 1) {
      days.push(
        this.createDay({
          className: 'unavailable',
          key: i
        }, i)
      );
    }

    i = 1;

    while (days.length % 7 !== 0) {
      days.push(
        this.createDay({
          className: 'other-month',
          key: `o${i}`
        }, i)
      );
    }

    for (i = 0; i < prices.length; i += 1) {
      prices[i] = (
        <div key={i} className="admin-room-panel-prices-field">
          <span className="label" onClick={this.labelFunction}>
            {`${i + 1} человек:`}
          </span>
          <input
            value={prices[i]}
            onChange={this.filterInput}
            maxLength="5"
          />
          <span>
            ₽
          </span>
        </div>
      );
    }

    return (
      <div className="admin-room-panel">
        <div className="admin-room-panel-calendar">
          <div className="admin-room-panel-calendar-header">
            {this.state.currentYear}
          </div>
          <div className="admin-room-panel-calendar-control">
            <button
              className={
                "admin-room-panel-calendar-control-button" +
                (isFirstMonth ? " disabled" : "")
              }
              onClick={isFirstMonth ? null : this.switchMonth}
            >
              <i className="fas fa-caret-left" />
            </button>
            <span>
              {this.indexToMonth[this.state.currentMonth]}
            </span>
            <button
              className={
                "admin-room-panel-calendar-control-button" +
                (isLastMonth ? " disabled" : "")
              }
              onClick={isLastMonth ? null : this.switchMonth}
            >
              <i className="fas fa-caret-right" />
            </button>
          </div>
          <div className="admin-room-panel-calendar-content">
            {days}
          </div>
        </div>
        <div className="admin-room-panel-prices">
          <button
            className="admin-room-panel-prices-multiple"
            onClick={this.toggleMultiple}
          >
            {
              this.state.multipleChoice ?
                "Выключить режим множественного выбора" :
                "Включить режим множественного выбора"
            }
          </button> 
          <form>
            {prices}
            <button
              className={
                "admin-room-panel-prices-reset" + (this.state.pricesSet ?
                  "" : " disabled"
                )
              }
              type="button"
              onClick={this.resetPrices}
            >
              Сброс цен
            </button>
            <button
              className={
                "admin-room-panel-prices-submit" + (this.state.pricesSet ?
                  "" : " disabled"
                )
              }
              type="button"
              onClick={this.submitPrices}
            >
              Подтвердить
            </button>
          </form>
        </div>
      </div>
    );
  }
}