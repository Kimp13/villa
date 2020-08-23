const strapi = global.strapi,
      auth = require("../../../utils/ctxAuthentication"),
      searchToJson = require("../../../utils/searchToJson"),
      validateBookingText = require("../../../utils/validateBookingText");

module.exports = {
  find: async ctx => {
    function mergeBookings(bookings) {
      const length = bookings.length;
      let i = 0, result = new Array();

      for (i; i < length; i += 1) {
        let itemToPush = bookings[i];

        while (i + 1 < length &&
          dateSmaller(bookings[i + 1].from, itemToPush.to, false)) {
          i += 1;
          if (dateSmaller(itemToPush.to, bookings[i].to)) {
            itemToPush.to.year = bookings[i].to.year;
            itemToPush.to.month = bookings[i].to.month;
            itemToPush.to.day = bookings[i].to.day;
          }
        }

        result.push(itemToPush);
      }

      return result;
    }

    let search;

    try {
      search = searchToJson(ctx.request.url);
    } catch(e) {
      ctx.status = 400;
      return;
    }

    if (search.roomId) {
      const userAuth = auth(ctx),
            bookings = strapi.query('booking').find({roomId: search.roomId});

      if (userAuth.jwt) {
        try {
          let user = await strapi.plugins['users-permissions'].services.jwt.verify(userAuth.jwt);

          user = await strapi.query('user', 'users-permissions').findOne({
            id: user.id
          });

          if (user.role.type === 'root') {
            ctx.send(bookings);
          }
        } catch(e) {console.log(e);}
      }

      ctx.send(mergeBookings(bookings));
      return;
    }

    ctx.status = 400;
    return;
  },
  create: async ctx => {
    let body;

    try {
      body = ctx.request.body;
    } catch(e) {
      ctx.throw(400);
    }

    if (body.jwt) {
      let user;

      try {
        user = await strapi.query('user', 'users-permissions').findOne({
          id: (await strapi.plugins['users-permissions'].services.jwt.verify(body.jwt)).id
        });

        if (user.role && user.role.type === 'root') {
          let from = body.from.split('.'),
              to = body.to.split('.'),
              date = new Date();

          for (let i = 0; i < 3; i += 1) {
            from[i] = parseInt(from[i]);
            to[i] = parseInt(to[i]);
          }

          from[1] -= 1;
          to[1] -= 1;

          date.setDate(from[0]);
          date.setMonth(from[1]);
          date.setFullYear(from[2]);

          from = new Date(date.getTime());

          date.setDate(to[0]);
          date.setMonth(to[1]);
          date.setFullYear(to[2]);

          to = date;

          strapi.query('message').update({
            id: body.messageId
          }, {
            text: `${body.roomId}_${body.from}_${body.to}` + 
                  `_${body.accepted ? 'accepted' : 'rejected'}`
          });

          strapi.query('booking').create({
            from,
            to,
            roomId: body.roomId
          });

          ctx.send('OK');
        }
      } catch(e) {
        ctx.throw(401);
        return;
      }
    }

    ctx.throw(400);
  },
  new: async ctx => {
    let userAuth = auth(ctx),
        user;

    if (userAuth.jwt) {
      try {
        user = await strapi.plugins['users-permissions'].services.jwt.verify(userAuth.jwt);

      } catch(e) {
        ctx.throw(401);
        return;
      }
    } else if (userAuth.jwta) {
      user = await strapi.plugins['villa-user-management'].services.anon.verify(userAuth.jwta);

      if (user.isAuthenticated === false) {
        ctx.throw(401);
        return;
      }
    }

    let booking = strapi.query('message').findOne({
          type: 'booking',
          authorId: user.id,
          sort: 'created_at:desc'
        }),
        counter = 0;

    if (booking) {
      for (let i = 0; i < booking.text.length; i += 1) {
        console.log(counter);
        if (booking.text[i] === '_' && ++counter === 3) {
          try {
            let search = searchToJson(ctx.request.url);

            if (validateBookingText(search.booking)) {
              let rootId = String((await strapi.query('role', 'users-permissions').findOne({
                    type: 'root'
                  })).users[0].id),
                  conversationId;

              strapi.plugins['villa-user-management'].services.bookings.newRequest(
                user, booking.conversationId, search.booking, rootId
              );

              ctx.status = 200;
              return;
            } else {
              ctx.throw(400);
            }
          } catch(e) {
            console.log(e);
            ctx.throw(400);
          }
        }
        
        ctx.throw(403);
        return;
      }
    }

    try {
      let search = searchToJson(ctx.request.url);

      if (validateBookingText(search.booking)) {
        let rootId = String((await strapi.query('role', 'users-permissions').findOne({
              type: 'root'
            })).users[0].id),
            conversationId;

        conversationId = (await strapi.query('conversation').findOne({
          participants_contains: [user.id, rootId]
        })).id;

        strapi.plugins['villa-user-management'].services.bookings.newRequest(
          user, conversationId, search.booking, rootId
        );

        ctx.status = 200;
        return;
      }
    } catch(e) {
      console.log(e);
      ctx.throw(400);
    }

    ctx.throw(400);
    return;
  }
};