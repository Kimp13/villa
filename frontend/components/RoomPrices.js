import React from "react";

import "../public/styles/components/roomPrices.scss";

export default class RoomPrices extends React.Component {
  constructor(props) {
    super(props);
    this.prices = props.prices;
    this.convertNumberToMonth = props.convertNumberToMonth;
  }

  render() {
    let columns = [<th key={0}>Количество людей</th>], rows = [], prices = [], pricesKeys = [];
    if (this.prices.length === 1) {
      columns.push(<th key={1}>Всё время</th>);
      prices.push(this.prices[0]);
    } else {
      let i, text;
      for (i = 0; i < this.prices.length; i += 1) {
        for (let j = 0; j < this.prices[i].from.length; j += 1) {
          prices.push({from: this.prices[i].from[j], prices: this.prices[i].prices});
        }
      }
      prices = prices.sort((a, b) => {
        return a.from - b.from;
      });
      for (i = 0; i < prices.length - 1; i += 1) {
        text = this.convertNumberToMonth[prices[i].from - 1];
        if (prices[i].from + 1 !== prices[i + 1].from) {
          text += ' – ';
          if (prices[i + 1].from === 1) {
            text += this.convertNumberToMonth[11];
          } else {
            text += this.convertNumberToMonth[prices[i + 1].from - 2];
          }
        }
        columns.push(<th key={i+1}>{text}</th>);
      }
      text = this.convertNumberToMonth[prices[i].from - 1];
      if (prices[i].from + 1 !== prices[0].from) {
        text += ' – ';
        if (prices[0].from === 1) {
          text += this.convertNumberToMonth[11];
        } else {
          text += this.convertNumberToMonth[prices[0].from - 2];
        }
      }
      columns.push(<th key={i+1}>{text}</th>);
    }
    prices = prices.map(price => price.prices);
    pricesKeys = Object.keys(prices[0]);
    rows.push(
      <tr key={0}>
        {columns}
      </tr>
    );
    for (let i = 0; i < pricesKeys.length; i += 1) {
      columns = [];
      columns.push(<td key={0}>{pricesKeys[i]}</td>)
      for (let j = 0; j < prices.length; j += 1) {
        columns.push(<td key={j+1}>{prices[j][pricesKeys[i]]}</td>);
      }
      rows.push(
        <tr key={i+1}>
          {columns}
        </tr>
      );
    } 
    return (
      <div className="room-prices">
        <h2>
          Цены на номер
        </h2>
        <table>
          <thead>
            {rows.shift()}
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}