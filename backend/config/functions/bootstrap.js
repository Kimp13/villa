'use strict';

function getCookie(cookie, cookieString) {
  if (cookieString === undefined) {
    cookieString = document.cookie;
  }
  let allCookies = cookieString.split(';');
  for (let i = 0; i < allCookies.length;  i += 1) {
    let equalsSignIndex = allCookies[i].indexOf('=');
    if (allCookies[i].substring(0, equalsSignIndex).trim() === cookie) {
      return allCookies[i].substring(equalsSignIndex + 1);
    }
  }
  return null;
}

module.exports = () => {

  const strapi = global.strapi;

  let interval = setInterval(() => {
    if (strapi.server) {
      clearInterval(interval);

      const io = require('socket.io')(strapi.server),
            userManagement = strapi.plugins['villa-user-management'].controllers,
            emitUser = (socket, user, isAnonymous) => {
              if (isAnonymous) {
                user.id = 'anon' + user.id;
              } else {
                user.id = user.id.toString();
              }

              io.userToSocketId[user.id] = socket.id;

              socket.userId = user.id;
              socket.emit('user', {
                isAuthenticated: true,
                isRoot: (user.role && user.role.type === 'root'),
                isAnonymous,
                id: user.id,
                name: user.name,
                surname: user.surname,
                phoneNumber: user.phoneNumber
              });
            },
            emitUnregisteredUser = socket => {
              socket.emit('user', {
                isAuthenticated: false
              });
            };

      io.userToSocketId = new Object();

      io.on('connection', socket => {
        let cookieString;

        try {
          cookieString = socket.conn.request.headers.cookie;
          if (!cookieString) {
            cookieString = '';
          }
        } catch(e) {
          cookieString = '';
        }

        let jwt, anonId;

        jwt = getCookie('jwt', cookieString);

        if (jwt) {
          strapi.plugins['users-permissions'].services.jwt.verify(jwt)
            .then(registeredUser => {
              if (registeredUser) {
                strapi.query('user', 'users-permissions').findOne({
                  id: registeredUser.id
                })
                  .then(user => emitUser(socket, user, false));
              } else {
                emitUnregisteredUser(socket);
              }
            }, e => {
              emitUnregisteredUser(socket);
            });
        } else {
          anonId = getCookie('a', cookieString);
          if (anonId) {
            strapi.query('anonymoususer').findOne({
              id: anonId
            })
              .then(anon => {
                if (anon) {
                  emitUser(socket, anon, true);
                } else {
                  emitUnregisteredUser(socket);
                }
              });
          } else {
            emitUnregisteredUser(socket);
          }
        }

        socket.on('newMessage', data => {
          strapi.query('conversation').findOne({
            id: data.conversationId
          })
            .then(conversation => {
              if (conversation) {
                for (let i = 0; i < conversation.participants.length; i += 1) {
                  if (conversation.participants[i] === socket.userId) {
                    let createQuery = {
                          authorId: socket.userId,
                          conversationId: conversation.id,
                          type: 'default',
                          text: data.text
                        };

                  strapi.query('message').create(createQuery)
                    .then(message => {
                      for (let participant of conversation.participants) {
                        io.to(strapi.io.userToSocketId[participant]).emit(
                          'newMessage',
                          createQuery
                        );
                      }

                      strapi.query('conversation').update({
                        id: conversation.id
                      }, {
                        lastMessage: message.id
                      });
                    }, e => console.log(e));
                  }
                }
              }
            }, e => console.log(e));
        });

        socket.on('disconnect', () => {
          if (socket.userId) {
            delete io.userToSocketId[socket.userId];
          }
        });
      });

      strapi.io = io;
    }
  });   
};
