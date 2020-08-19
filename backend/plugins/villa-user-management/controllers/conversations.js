const strapi = global.strapi,
      getParamsFromUrl = require("../../../utils/searchToJson.js"),
      ctxAuth = require("../../../utils/ctxAuthentication");

module.exports = {
  find: async function (ctx) {
    let query, auth = ctxAuth(ctx);

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.throw(400);
      return;
    }

    if (!query) {
      query = {
        _skip: 0
      }
    }

    let user;

    if (auth.jwt) {
      try {
        user = await strapi.plugins['users-permissions'].services.jwt.verify(auth.jwt);
      } catch(e) {
        ctx.status = 401;
        return;
      }

      user.id = user.id.toString();
      query._limit = 10;
    } else if (auth.jwta) {
      user = await strapi.plugins['villa-user-management'].services.anon.verify(auth.jwta);

      if (!user.isAuthenticated) {
        ctx.throw(401);
        return;
      }

      user.id = 'anon' + user.id;
      query._limit = 1;
    } else {
      ctx.status = 401;
      return;
    }

    let conversations;

    if (query.id) {
      let i;

      conversations = await strapi.query('conversation').findOne({
        id: query.id
      });

      console.log(conversations.participants);

      if (conversations) {
        for (i = 0; i < conversations.participants.length; i += 1) {
          if (conversations.participants[i] === user.id) {
            conversations = [conversations];
            break;
          }
        }
      }

      if (typeof(conversations) !== "object") {
        ctx.throw(400);
        return;
      }
    } else {
      conversations = await strapi.query('conversation').find({
        participants_containss: user.id,
        _limit: query._limit,
        _start: query._skip || 0,
        _sort: 'updated_at:desc'
      });
    }

    for (let i = 0; i < conversations.length; i += 1) {
      let participants = new Object();

      for (let j = 0; j < conversations[i].participants.length; j += 1) {
        let participant;

        if (conversations[i].participants[j].substring(0, 4) === 'anon') {
          participant = await strapi.query('anonymoususer')
            .findOne({
              id: conversations[i].participants[j].substring(4)
            });

          participant.id = `anon${participant.id}`;
        } else {
          participant = await strapi.query('user', 'users-permissions')
            .findOne({
              id: conversations[i].participants[j]
            });
        }

        if (participant) {
          participants[participant.id] = {
            name: participant.name,
            surname: participant.surname,
            phoneNumber: participant.phoneNumber
          }
        }
        conversations[i].participants[j] = null;
      }

      let lastMessage;

      if (conversations[i].lastMessage !== null) {
        lastMessage = await strapi.query('message').findOne({
          id: conversations[i].lastMessage
        });

        conversations[i].lastMessage = {
          authorId: lastMessage.authorId,
          text: lastMessage.text,
          type: lastMessage.type,
          created_at: lastMessage.created_at
        };
      }

      conversations[i] = {
        id: conversations[i].id,
        lastMessage: conversations[i].lastMessage,
        participants
      };
    }

    ctx.send(JSON.stringify(conversations));
  },
  count: async function (ctx) {
    let auth = ctxAuth(ctx);

    if (auth.jwt) {
      let user, count;

      try {
        user = await strapi.plugins['users-permissions'].services.jwt.verify(auth.jwt);
      } catch(e) {
        ctx.status = 401;
        return;
      }

      count = await strapi.query('conversation').count({
        participants_containss: user.id
      });

      ctx.send(count);
    } else if (auth.jwta) {
      user = await strapi.plugins['villa-user-management'].services.anon.verify(auth.jwta);

      if (user.isAuthenticated) {
        ctx.send(1);
        return;
      }
    }

    ctx.status = 401;
    return;
  }
}