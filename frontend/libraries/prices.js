import { dateSmaller } from "./dates";

module.exports = {
  getDatePrices: (date, priceInfo) => {
    const dateStrings = Object.keys(priceInfo);
    let dates = new Array(), i;

    for (i = 0; i < dateStrings.length; i += 1) {
      dates[i] = {
        day: Number(dateStrings[i].substring(0, 2)),
        month: Number(dateStrings[i].substring(3)),
        year: 1
      }
    }

    for (i = 1; i < dates.length; i += 1) {
      let j = i, temp;
      while (j > 0 && dateSmaller(dates[j], dates[j - 1])) {
        temp = dates[j];
        dates[j] = dates[j - 1];
        dates[j - 1] = temp;
        temp = dateStrings[j];
        dateStrings[j] = dateStrings[j - 1];
        dateStrings[--j] = temp;
      }
    }

    if (
      dates[0].month > date.month ||
      (dates[0].month === date.month && 
      dates[0].day >= date.day)
    ) {
      return priceInfo[dateStrings[dates.length - 1]].slice();
    }

    for (i = 1; i < dates.length; i += 1) {
      if (
        dates[i].month > date.month ||
        (dates[i].month === date.month &&
        dates[i].day > date.day)
      ) {
        return priceInfo[dateStrings[i - 1]].slice();
      }
    }

    return priceInfo[dateStrings[dates.length - 1]].slice();
  }
};