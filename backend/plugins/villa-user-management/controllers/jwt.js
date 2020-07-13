module.exports = {
  async check(ctx, next, extended = false) {
    try {
      const token = ctx.request.header.authorization.substring(7),
            userId = (await strapi.plugins['users-permissions'].services.jwt.verify(token))._id;
      if (userId) {
        user = await strapi.plugins['users-permissions'].models.user.findOne({id: userId});
        if (extended) {
          return user;
        } else {
          let role = await strapi.plugins['users-permissions'].models.role.findOne({_id: user.role});
          ctx.send(JSON.stringify({
            name: user.name,
            surname: user.surname,
            username: user.username,
            phoneNumber: user.phoneNumber,
            isRoot: (role.type === 'root')
          }));
        }
      } else {
        ctx.throw(401);
      }
    } catch(e) {
      ctx.throw(401);
    }
  }
}