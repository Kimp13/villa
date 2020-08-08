const strapi = global.strapi;

module.exports = {
  isDateFree: date => {
    let queryDate = new Date();

    queryDate.setDate(date.from.day);
    queryDate.setMonth(date.from.month - 1);
    queryDate.setFullYear(date.from.year);

    return new Promise((resolve, reject) => {
      strapi.query('booking').find({
        _limit: 1,
        _sort: 'to:asc',
        to_gt: queryDate
      })
        .then(booking => {
          if (booking) {
            if (booking.from.getFullYear() < date.to.year) {
              reject('Occupied. Sorry.');
            } else if (booking.from.getFullYear() === date.to.year) {
              let month = booking.from.getMonth() + 1;

              if (month < date.to.month) {
                reject('Occupied. Sorry.');
              } else if (month === date.to.month) {
                if (booking.from.getDate() < date.to.day) {
                  reject('Occupied. Sorry.');
                }
              }
            }
          }
          resolve(true);
        })
    });
  }
};