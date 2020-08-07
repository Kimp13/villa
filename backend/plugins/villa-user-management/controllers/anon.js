let strapi = global.strapi;

module.exports = {
  async get(ctx, next) {
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
  },
  async new(ctx) {
    let { phoneNumber, name, surname, firstBooking } = ctx.request.body,
        createQuery = {
          phoneNumber
        };

    name ? createQuery.name = name : null;
    surname ? createQuery.surname = surname : null;

    const anon = await strapi.query('anonymoususer').create(createQuery);

    const newConversation = await strapi.query('conversation').create({
      participants: [
        'anon' + anon.id,
        '1'
      ]
    });

    if (firstBooking) {
      const query = {
              type: 'booking',
              authorId: 'anon' + anon.id,
              conversationId: newConversation.id,
              text: firstBooking
            },
            message = await strapi.query('message').create(query);

      strapi.query('conversation').update({
        id: newConversation.id
      },
      {
        lastMessage: message.id
      });

      strapi.io.to(strapi.io.userToSocketId['1']).emit('newMessage', query);
    }

    ctx.send(JSON.stringify(anon));
  }
}