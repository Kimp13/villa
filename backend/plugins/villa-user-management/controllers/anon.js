let strapi = require('strapi');

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

    try {
      firstBooking = JSON.parse(firstBooking);
    } catch(e) {
      firstBooking = false;
    }

    name ? createQuery.name = name : null;
    surname ? createQuery.surname = surname : null;

    const anon = await strapi.models.anonymoususer.create(createQuery);

    const newConversation = await strapi.models.conversation.create({
      participants: [
        'anon' + anon.id,
        '1'
      ]
    });

    if (firstBooking) {
      const message = await strapi.models.message.create({
        conversationId: newConversation.id,
        authorId: 'anon' + anon.id,
        type: 'booking',
        text: firstBooking.from + '_' + firstBooking.to
      });
    }

    console.log(newConversation);
  }
}