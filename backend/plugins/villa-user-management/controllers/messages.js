const strapi = require('strapi');

module.exports = {
  async find(ctx) {
    try {
      let body = ctx.request.body,
          socket = strapi.io.sockets.connected[body.socketId],
          conversationId = body.conversationId,
          skip = body.skip || 0,
          limit = body.limit || 50;

      let findIndex = authorId => {
        if (authorId === socket.userId) {
          return 0;
        } else {
          let counter = 1;
          for (let i = 0; i < conversation.participants.length; i += 1) {
            if (conversation.participants[i] !== socket.userId) {
              if (conversation.participants[i] === authorId) {
                return counter;
              }
              counter += 1;
            }
          }
        }
      }

      let query = {conversationId};

      let conversation = await strapi.models.conversation.findOne({
            id: conversationId
          }),
          response = await strapi.models.message.find(query)
            .sort({
              createdAt: -1
            })
            .limit(limit)
            .skip(skip);

      for (let i = 0; i < response.length; i += 1) {
        response[i] = {
          type: response[i].type,
          text: response[i].text,
          authorId: findIndex(response[i].authorId),
          attachments: response[i].attachments
        }
      }

      ctx.send(JSON.stringify(response));
    } catch(e) {
      ctx.send('');
    }
  },
  async count(ctx) {
    try {
      let response = await strapi.models.message.countDocuments({conversationId: ctx.request.body});
      ctx.send(response.toString());
    } catch(e) {
      ctx.send('');
    }
  }
}