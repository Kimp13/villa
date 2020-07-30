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
              socket.userId = user.id;
              socket.emit('user', {
                isAuthenticated: true,
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
      });

      strapi.io = io;
    }
  });   
};
