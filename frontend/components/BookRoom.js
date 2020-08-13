import React from "react";

import ChooseDate from "./ChooseDate";

import {
  incrementDate,
  getDaysAmountInMonthOfYear,
  dateSmallerNonStrict
} from "../libraries/dates";
import { getDatePrices } from "../libraries/prices";

import "../public/styles/components/bookRoom.scss";

export default class BookRoom extends React.Component {
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
      window.location.href = '/messages';
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
    let submitButton;

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

    return (
      <div className="content-flex-wrapper">
        <div className="book-room">
          <h2>
            Забронировать
          </h2>
          <form className="flex-book-form">
            <ChooseDate
              bookings={this.props.bookings}
              from={this.props.from}
              to={this.props.to}
              setData={this.getData}
            />
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