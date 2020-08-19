let strapi = global.strapi;

module.exports = {
  async new(ctx) {
    let { phoneNumber, name, surname, firstBooking } = ctx.request.body,
        createQuery = {
          phoneNumber
        };

    if (name) {
      createQuery.name = name;
    }

    if (surname) {
      createQuery.surname = surname;
    }

    createQuery.jwt = strapi.plugins['users-permissions'].services.jwt.issue(createQuery);

    const anon = await strapi.query('anonymoususer').create(createQuery),
          role = await strapi.query('role', 'users-permissions').findOne({
            type: 'root'
          }),
          rootId = String(role.users[0].id);

    anon.id = 'anon' + anon.id;

    const newConversation = await strapi.query('conversation').create({
      participants: [
        anon.id,
        rootId
      ]
    });

    if (firstBooking) {
      strapi.plugins['villa-user-management'].services.bookings.newRequest(
        anon,
        newConversation.id,
        firstBooking,
        rootId
      );
    }

    ctx.send({
      jwt: createQuery.jwt
    });
  }
}