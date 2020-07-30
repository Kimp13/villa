const strapi = global.strapi;

function getParamsFromUrl(url) {
  let searchStart = url.indexOf('?'),
      query = new Object();

  if (searchStart === -1) {
    return false;
  }

  let search = url.substring(searchStart + 1);

  if (search.length === 0) {
    return false;
  }

  search = search.split('&');

  for (let i = 0; i < search.length; i += 1) {
    let pair = search[i].split('=');

    query[pair[0]] = pair[1];
  }

  return query;
}

module.exports = {
  find: async function (ctx) {
    console.log(ctx);

    let response = await strapi.query('conversation').find({
          participants: socket.userId,
          _limit: limit || 10,
          _start: skip || 0
        });

    for (let i = 0; i < response.length; i += 1) {
      let user;

      for (let j = 0; j < response[i].participants.length; j += 1) {
        if (response[i].participants[j].substring(0, 4) === 'anon') {
          user = await strapi.query('anonymoususer').findOne({
            id: response[i].participants[j].substring(4)
          });
        } else {
          user = await strapi.query('user', 'users-permissions').findOne({
            id: response[i].participants[j]
          });
        }

        response[i].participants[j] = {
          name: user.name,
          surname: user.surname,
          phoneNumber: user.phoneNumber,
          id: user.id
        };
      }
      let lastMessage = response[i].lastMessage;

      if (lastMessage) {
        lastMessage = await strapi.query('message').findOne({id: lastMessage});

        lastMessage = {
          type: lastMessage.type,
          text: lastMessage.text,
          authorId: lastMessage.authorId,
        }
      }

      response[i] = {
        id: response[i].id,
        participants: response[i].participants,
        lastMessage
      };
    }

    return response;
  },
  count: async function (ctx) {
    try {
      let query = getParamsFromUrl(ctx.request.url);

      console.log(query);

      if (query) {
        try {
          let user = await strapi.plugins['users-permissions'].services.jwt.verify(query.jwt),
              count = await strapi.query('conversation').count({
                participants: user.id
              });

          ctx.send(count);
        } catch(e) {
          console.log(e);

          ctx.throw(401);
        }
      } else {
        ctx.throw(400);
      }
    } catch(e) {
      console.log(e);

      ctx.throw(400);
    }
  }
}