'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

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

const userManagement = strapi.plugins['villa-user-management'].controllers;

module.exports = cb => {

  const io = require('socket.io')(strapi.server),
        emitUser = (socket, user, isAnonymous) => {
          socket.userId = user.id;
          strapi.models.conversation.find().limit(-1)
            .then(conversations => {
              for (let i = 0; i < conversations.length; i += 1) {
                socket.join(conversations[i].id);
              }
            });
          strapi.plugins['users-permissions'].models.role.findOne({
            _id: user.role
          })
            .then(role => {
              socket.emit('user', {
                isAuthenticated: true,
                isAnonymous,
                isRoot: (role.type === 'root'),
                name: user.name,
                surname: user.surname,
                phoneNumber: user.phoneNumber
              });
              socket.on('getConversations', function(cfg) {
                cfg ? null : cfg = {};
                userManagement.conversations.find(this, cfg.limit, cfg.skip)
                  .then(data => socket.emit('getConversations', data));
              });
              socket.on('getConversationsCount', function() {
                userManagement.conversations.count(this)
                  .then(count => socket.emit('getConversationsCount', count));
              });
            });
        },
        emitUnregisteredUser = socket => {
          socket.emit('user', {
            isAuthenticated: false
          });
          console.log(`Незарегистрированный пользователь подключился.`);
        };

  io.on('connection', (socket) => {
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
            strapi.plugins['users-permissions'].models.user.findOne({
              _id: registeredUser._id
            })
              .then(user => emitUser(socket, user, false));
          } else {
            emitUnregisteredUser(socket);
          }
        });
    } else {
      anonId = getCookie('a', cookieString);
      if (anonId) {
        strapi.models.anonymoususer.findOne({
          _id: anonId
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
  });

  strapi.io = io;

  cb();
};
