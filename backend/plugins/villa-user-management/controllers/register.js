const strapi = global.strapi;

function verifyBody(body) {
  if (body.name && body.surname && body.email && body.username && body.password) {
    let regex = /[^А-яЁё]/;

    if (regex.test(body.name) || regex.test(body.surname)) {
      return false;
    }

    regex = /^\w+@\w+\.\w{2,}$/;

    if (!(regex.test(body.email))) {
      return false;
    }

    regex = /[^a-zA-Z0-9$%^*_-]/;

    if (regex.test(body.username)) {
      return false;
    }

    if (body.password.length < 8 || body.password.length > 128) {
      return false;
    }

    return true;
  }

  return false;
}

module.exports = {
  create: async ctx => {
    let body;

    try {
      body = ctx.request.body;
    } catch(e) {
      ctx.throw(400);
      return;
    }

    let user;

    if (body.anon) {
      user = await strapi.query('anonymoususer').findOne({
        id: body.anon.substring(4)
      });
    } else {
      user = true;
    }

    if (user && verifyBody(body)) {
      if (
        await strapi
          .query('user', 'users-permissions')
          .findOne({email: body.email}) !== null
      ) {
        ctx.status = 403;
        ctx.message = 'e';
        return;
      }

      body.name = 
        body.name.charAt(0).toUpperCase() + 
        body.name.substring(1).toLowerCase();
      body.surname =
        body.surname.charAt(0).toUpperCase() +
        body.name.substring(1).toLowerCase();

      try {
        const newUser = await strapi.query('user', 'users-permissions').create({
                name: body.name,
                surname: body.surname,
                email: body.email,
                username: body.username,
                password: body.password
              }),
              jwt = await strapi.plugins['users-permissions'].services.jwt.issue({
                id: newUser.id
              });

        if (body.anon) {
          const conversation = await strapi.query('conversation').findOne({
            participants_contains: body.anon
          });

          for (let i = 0; i < conversation.participants.length; i += 1) {
            if (conversation.participants[i] === body.anon) {
              conversation.participants[i] = String(newUser.id);
            }
          }

          strapi.query('conversation').update({
            id: conversation.id
          }, {
            participants: conversation.participants
          });

          strapi.query('message').update({
            authorId: body.anon
          }, {
            authorId: newUser.id
          });
        }
            
        ctx.status = 200;
        ctx.message = jwt;
        return;
      } catch(e) {
        console.log(e);
        ctx.throw(403);
        return;
      }
    }

    ctx.throw(400);
    return;
  }
}