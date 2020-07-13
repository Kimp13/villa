const strapi = require('strapi');

module.exports = {
  async find(ctx) {
    let questionSignIndex = ctx.req.url.indexOf('?'),
        query = {},
        limit,
        skip;

    if (questionSignIndex !== -1) {
      let search = ctx.req.url.substring(questionSignIndex + 1),
          params = search.split('&');

      for (let i = 0; i < params.length; i += 1) {
        let equalsSignIndex = params[i].indexOf('='),
            key = params[i].substring(0, equalsSignIndex),
            value = params[i].substring(equalsSignIndex + 1);

        if (key === 'userId') {
          if (query.participants) {
            ctx.send('');
          } else {
            query.participants = 'anon' + value;
          }
        } else if (key === 'from') {
          skip = parseInt(value);
        } else if (key === 'count') {
          limit = parseInt(value);
        } else {
          ctx.send('');
          return;
        }
      }
    }

    try {
      let token = ctx.req.headers.authorization;
      if (token) {
        query.participants = (await strapi.plugins['users-permissions'].services.jwt.verify(token.substring(7))).id;
      }
    } catch(e) {}

    if (!query.participants) {
      ctx.send('');
      return;
    }

    skip ? null : skip = 0;
    limit ? null : limit = 100;

    let response = await strapi.models.conversation.find(query).limit(limit).skip(skip);

    for (let i = 0; i < response.length; i += 1) {
      let otherParticipants = Array(),
          user;
      for (let userId of response[i].participants) {
        if (userId !== query.participants) {
          if (userId.substring(0, 4) === 'anon') {
            user = await strapi.models.anonymoususer.findOne({
              _id: userId.substring(4)
            });
          } else {
            user = await strapi.plugins['users-permissions'].models.user.findOne({
              _id: userId
            });
          }
          otherParticipants.push({
            name: user.name,
            surname: user.surname,
            phoneNumber: user.phoneNumber
          });
        }
      }
      response[i] = {
        id: skip + i,
        otherParticipants
      }
    }

    ctx.send(JSON.stringify(response));
  },
  async count(ctx) {
    let participant;

    try {
      token = ctx.req.headers.authorization;
    } catch(e) {}

    if (token) {
      participant = (await strapi.plugins['users-permissions'].services.jwt.verify(token.substring(7))).id;
    } else {
      let search = ctx.req.url.substring(ctx.req.url.indexOf('?') + 1);

      if (search.indexOf('&') !== -1) {
        ctx.send('');
        return;
      } else {
        let equalsSignIndex = search.indexOf('='),
            key = search.substring(0, equalsSignIndex);
        if (key !== 'userId') {
          ctx.send('');
          return;
        } else {
          participant = 'anon' + search.substring(equalsSignIndex + 1);
        }
      }
    }

    let response = await strapi.models.conversation.countDocuments({participants: participant});
    ctx.send(JSON.stringify({
      count: response
    }));
  }
}