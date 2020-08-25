const strapi = global.strapi;

module.exports = {
  update: async ctx => {
    let body;

    try {
      body = ctx.request.body;
    } catch(e) {
      ctx.throw(400);
    }

    if (body.jwt && body.newPrices && body.roomId) {
      let userId;

      try {
        userId = await strapi
          .plugins
          ['users-permissions']
          .services
          .jwt
          .verify(body.jwt).id;
      } catch(e) {
        ctx.throw(401);
      }

      let user = await strapi.query('user', 'users-permissions').findOne({
        id: userId
      });

      if (user.role.type === 'root') {
        try {
          await strapi.query('room').update({
            id: body.roomId
          }, {
            priceInfo: body.newPrices
          });

          ctx.status = 200;
        } catch(e) {
          ctx.throw(400);
        }
      } else {
        ctx.throw(400);
      }
    } else {
      ctx.throw(400);
    }
  }
}
