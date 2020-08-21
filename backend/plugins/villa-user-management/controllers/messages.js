const strapi = global.strapi,
      _ = require('lodash'),
      getParamsFromUrl = require("../../../utils/searchToJson"),
      ctxAuth = require("../../../utils/ctxAuthentication"),
      getUser = require("../../../utils/getUser");

let validateText = text => {
  if (text) {
    text = text.trim().replace(/  +/g, ' ').replace(/\n\n+/g, '\n');

    if (text.length > 0) {
      return text;
    }
  }

  return false;
};

module.exports = {
  find: async ctx => {
    let query, auth = ctxAuth(ctx);

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.status = 400;
      return;
    }

    
    if (query && query.conversationId) {
      let user = await getUser(auth);

      if (user) {
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
      } else {
        ctx.status = 401;
        return;
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
      let user = await getUser(auth);

      if (user) {
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
      } else {
        ctx.status = 401;
        return;
      }
    }
    
    ctx.status = 400;
    return;
  },
  create: async ctx => {
    let body;

    try {
      body = ctx.request.body;
    } catch(e) {
      ctx.status = 400;
      return;
    }

    body.text = validateText(body.text);

    if (body.conversationId && body.text) {
      let user = await getUser(body);

      if (user) {
        let conversation = await strapi.query('conversation').findOne({
          id: body.conversationId
        });

        if (conversation) {
          for (let i = 0; i < conversation.participants.length; i += 1) {
            if (conversation.participants[i] === user.id) {
              let createQuery = {
                    authorId: user.id,
                    conversationId: conversation.id,
                    type: 'default',
                    text: body.text
                  },
                  message = await strapi.query('message').create(createQuery);

              setTimeout(() => {
                for (let participant of conversation.participants) {
                  if (participant !== user.id) {
                    strapi.io.to(strapi.io.userToSocketId[participant]).emit(
                      'newMessage',
                      _.pick(message, ['text', 'authorId', 'type', 'id', 'conversationId'])
                    );
                  }
                }

                strapi.query('conversation').update({
                  id: conversation.id
                }, {
                  lastMessage: message.id
                });
              }, 0);

              ctx.status = 200;
              ctx.message = String(message.id);
              return;
            }
          }
        }
      } else {
        ctx.status = 401;
        return;
      }
    }

    ctx.status = 400;
    return;
  }
}