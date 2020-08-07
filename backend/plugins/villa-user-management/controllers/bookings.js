const strapi = global.strapi;

module.exports = {
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
  }
};