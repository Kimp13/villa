const strapi = global.strapi,
      getParamsFromUrl = require("../../../utils/searchToJson.js");

module.exports = {
  find: async function (ctx) {
    let query;

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.throw(400);
      return;
    }

    try {
      if (query) {
        let user;

        if (query.jwt) {
          user = await strapi.plugins['users-permissions'].services.jwt.verify(query.jwt);

          user.id = user.id.toString();
        } else if (query.a) {
          user = await strapi.query('anonymoususer').findOne({id: query.a});

          if (user) {
            user.id = `anon${user.id}`;
          } else {
            ctx.throw(401);
            return;
          }

          query._limit = 1;
        } else {
          ctx.throw(400);
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
            _limit: 10,
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
      } else {
        ctx.throw(400);
      }
    } catch(e) {
      console.log(e);

      ctx.throw(401);
    }
  },
  count: async function (ctx) {
    let query;

    try {
      query = getParamsFromUrl(ctx.request.url);
    } catch(e) {
      ctx.throw(400);
      return;
    }

    try {
      if (query) {
        if (query.jwt) {
          let user = await strapi.plugins['users-permissions'].services.jwt.verify(query.jwt),
              count = await strapi.query('conversation').count({
                participants_containss: user.id
              });

          ctx.send(count);
        } else if (query.a) {
          let user = await strapi.query('anonymoususer').findOne({id: query.a});

          if (user) {
            ctx.send(1);
          } else {
            ctx.throw(401);
          }
        } else {
          ctx.throw(400);
        }
      } else {
        ctx.throw(400);
      }
    } catch(e) {
      ctx.throw(401);
    }
  }
}