const strapi = require('strapi');

module.exports = {
  find: async function (socket, limit, skip) {
    limit ? null : limit = 10;
    skip ? null : skip = 0
    let query = {
          participants: socket.userId
        },
        response = await strapi.models.conversation.find(query).limit(limit).skip(skip);

    for (let i = 0; i < response.length; i += 1) {
      let participantsIndexes = {},
          user,
          requesterId;

      for (let j = 0; j < response[i].participants.length; j += 1) {
        if (response[i].participants[j] === socket.userId) {
          requesterId = j;
          participantsIndexes[socket.userId] = j;
          response[i].participants[j] = null;
        } else {
          if (response[i].participants[j].substring(0, 4) === 'anon') {
            user = await strapi.models.anonymoususer.findOne({
              _id: response[i].participants[j].substring(4)
            });
          } else {
            user = await strapi.plugins['users-permissions'].models.user.findOne({
              _id: response[i].participants[j]
            });
          }
          if (user) {
            participantsIndexes[response[i].participants[j]] = j;
          }
          response[i].participants[j] = {
            name: user.name,
            surname: user.surname,
            phoneNumber: user.phoneNumber
          };
        }
      }
      let lastMessage = response[i].lastMessage;

      if (lastMessage) {
        lastMessage = await strapi.models.message.findOne({_id: lastMessage});

        lastMessage = {
          type: lastMessage.type,
          text: lastMessage.text,
          authorId: participantsIndexes[lastMessage.authorId],
        }
      }

      response[i] = {
        id: response[i].id,
        participants: response[i].participants,
        lastMessage,
        requesterId
      };
    }

    return response;
  },
  count: async function (socket) {
    return await strapi.models.conversation.countDocuments({
      participants: socket.userId
    });
  }
}