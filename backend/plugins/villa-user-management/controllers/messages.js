const strapi = global.strapi,
      getParamsFromUrl = require("../../../utils/searchToJson.js");

module.exports = {
  async find(ctx) {
    let query;

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.throw(400);
      return;
    }

    
    if (query && query.conversationId) {
      let user;

      if (query.jwt) {
        try {
          user = await strapi.plugins['users-permissions'].services.jwt.verify(query.jwt);
        } catch(e) {
          ctx.throw(401);
          return;
        }

        user.id = user.id.toString();
      } else if (query.a) {
        user = await strapi.query('anonymoususer').findOne({id: query.a});

        if (user === null) {
          ctx.throw(401);
          return;
        }

        user.id = `anon${user.id}`;
      } else {
        ctx.throw(400);
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
    ctx.throw(400);
  },
  async count(ctx) {
    let query;

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.throw(400);
      return;
    }

    
    if (query && query.conversationId) {
      let user;

      if (query.jwt) {
        try {
          user = await strapi.plugins['users-permissions'].services.jwt.verify(query.jwt);
        } catch(e) {
          ctx.throw(401);
          return;
        }

        user.id = user.id.toString();
      } else if (query.a) {
        user = await strapi.query('anonymoususer').findOne({id: query.a});

        if (user === null) {
          ctx.throw(401);
          return;
        }

        user.id = `anon${user.id}`;
      } else {
        ctx.throw(400);
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
    ctx.throw(400);
  }
}