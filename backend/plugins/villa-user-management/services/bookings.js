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
  },
  newRequest: (user, conversationId, text, rootId) => {
    const query = {
      type: 'booking',
      authorId: user.id,
      conversationId,
      text
    };
    
    strapi.query('message').create(query).then(message => {
      strapi.query('conversation').update({
        id: conversationId
      },
      {
        lastMessage: message.id
      });

      if (rootId) {
        strapi.io.to(strapi.io.userToSocketId[rootId]).emit('newMessage', query);

        strapi.plugins['email'].services.email.sendTemplatedEmail({
          to: 'o_she@mail.ru'
        }, {
          subject: 'Новая заявка на бронирование',
          text: 'Доброго времени суток! На сайте villafiolent.ru новая заявка на бронирование.',
          html: `
            <h1>Новая заявка</h1>
            <p>Телефон: <%= user.phoneNumber %>.</p>
            <p>Имя: <%= user.name %>.</p>
            <p>Фамилия: <%= user.surname %>.</p>`
        }, {
          user
        })
          .then(a => console.log(a), e => console.log(e));
      }
    });
  }
};