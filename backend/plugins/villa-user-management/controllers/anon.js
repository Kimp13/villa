let strapi = require('strapi');

module.exports = {
  async get(ctx, next) {
    console.log('anonie');
    try {
      let search = ctx.req.url.substring(ctx.req.url.indexOf('?') + 1),
          equalsSignIndex = search.indexOf('=');
      if (search.substring(0, equalsSignIndex) === 'userId') {
        userId = search.substring(equalsSignIndex + 1);
      } else {
        ctx.throw(401);
      }
      let user = await strapi.models.anonymoususer.findOne({_id: userId})
      ctx.send(JSON.stringify({
        name: user.name,
        surname: user.surname,
        phoneNumber: user.phoneNumber
      }));
    } catch(e) {
      ctx.throw(401);
    }
  }
}