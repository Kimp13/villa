const strapi = global.strapi,
      getParamsFromUrl = require("../../../utils/searchToJson"),
      ctxAuth = require("../../../utils/ctxAuthentication");

module.exports = {
  async find(ctx) {
    let query, auth = ctxAuth(ctx);

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.status = 400;
      return;
    }

    
    if (query && query.conversationId) {
      let user;

      if (auth.jwt) {
        try {
          user = await strapi.plugins['users-permissions'].services.jwt.verify(auth.jwt);
        } catch(e) {
          ctx.status = 401;
          return;
        }

        user.id = user.id.toString();
      } else if (auth.jwta) {
        user = await strapi.plugins['villa-user-management'].services.anon.verify(auth.jwta);

        if (!user.isAuthenticated) {
          ctx.status = 401;
          return;
        }

        user.id = `anon${user.id}`;
      } else {
        ctx.status = 401;
        return;
      }

      let conversation = await strapi.query('conversation').findOne({
        id: query.conversationId
      });

      if (conversation) {
        for (let i = 0; i < conversation.participants.length; i += 1) {
          if (conversation.participants[i] === user.id) {
            let messages = await strapi.query('message').find({
              conversationId: conversation.id,
              _limit: 50,
              _start: query._skip || 0,
              _sort: 'id:desc'
            });

            for (let i = 0; i < messages.length; i += 1) {
              messages[i] = {
                text: messages[i].text,
                authorId: messages[i].authorId,
                type: messages[i].type,
                id: messages[i].id
              }
            }

            ctx.send(JSON.stringify(messages));
            return;
          }
        }
      }
    }

    ctx.status = 400;
    return;
  },

  count: async ctx => {
    let query, auth = ctxAuth(ctx);

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.status = 400;
      return;
    }

    
    if (query && query.conversationId) {
      let user;

      if (auth.jwt) {
        try {
          user = await strapi.plugins['users-permissions'].services.jwt.verify(auth.jwt);
        } catch(e) {
          ctx.status = 401;
          return;
        }

        user.id = user.id.toString();
      } else if (auth.jwta) {
        user = await strapi.plugins['villa-user-management'].services.anon.verify(auth.jwta);

        if (!user.isAuthenticated) {
          ctx.status = 401;
          return;
        }

        user.id = `anon${user.id}`;
      } else {
        ctx.status = 401;
        return;
      }

      let conversation = await strapi.query('conversation').findOne({
            id: query.conversationId
          });

      if (conversation) {
        for (let i = 0; i < conversation.participants.length; i += 1) {
          if (conversation.participants[i] === user.id) {
            let count = await strapi.query('message').count({
              conversationId: query.conversationId
            });

            ctx.send(count);

            return;
          }
        }
      }
    }
    
    ctx.status = 400;
    return;
  }
}