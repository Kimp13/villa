'use strict';
const showdown = require('showdown'),
      emojiRegex = require('emoji-regex')(),
      parser = new showdown.Converter({
        noHeaderId: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        openLinksInNewWindow: true,
        emoji: true,
        underline: true
      });

module.exports = () => {
  const strapi = global.strapi;

  let interval = setInterval(() => {
    if (strapi.server) {
      clearInterval(interval);

      // const io = require('socket.io')(strapi.server),
      //       userManagement = strapi.plugins.villa.controllers,
      //       emitUser = (socket, user, isAnonymous) => {
      //         if (isAnonymous) {
      //           user.id = 'anon' + user.id;
      //         } else {
      //           user.id = String(user.id);
      //         }

      //         io.userToSocketId[user.id] = socket.id;

      //         socket.userId = user.id;
      //         socket.emit('user', {
      //           isAuthenticated: true,
      //           isRoot: (user.role && user.role.type === 'root'),
      //           isAnonymous,
      //           id: user.id,
      //           name: user.name,
      //           surname: user.surname,
      //           phoneNumber: user.phoneNumber
      //         });
      //       },
      //       emitUnregisteredUser = socket => {
      //         socket.emit('user', {
      //           isAuthenticated: false
      //         });
      //       };

      strapi.parseMD = text => (
        parser
          .makeHtml(text)
          .replace(
            emojiRegex,
            "<span class=\"emoji\">$&</span>"
          )
          .replace(
            /(<\/.+?>)(.+?)(<.+?>)/g,
            '$1<span class="plain">$2</span>$3'
          )
          .replace(
            /src="((\/.+?)+?)"/g,
            `src="${process.env.API_URL || 'http://localhost:1337'}$1"`
          )
      );

      // io.userToSocketId = new Object();

      // io.sockets.on('connection', socket => {
      //   let cookieString;

      //   try {
      //     cookieString = socket.conn.request.headers.cookie;
      //     if (!cookieString) {
      //       cookieString = '';
      //     }
      //   } catch(e) {
      //     cookieString = '';
      //   }

      //   let jwt;

      //   jwt = getCookie('jwt', cookieString);

      //   if (jwt) {
      //     strapi.plugins['users-permissions'].services.jwt.verify(jwt)
      //       .then(registeredUser => {
      //         if (registeredUser) {
      //           strapi.query('user', 'users-permissions').findOne({
      //             id: registeredUser.id
      //           })
      //             .then(user => emitUser(socket, user, false));
      //         } else {
      //           emitUnregisteredUser(socket);
      //         }
      //       }, e => {
      //         console.log(e);
      //         emitUnregisteredUser(socket);
      //       });
      //   } else {
      //     jwt = getCookie('jwta', cookieString);
      //     if (jwt) {
      //       strapi.plugins.villa.services.anon.verify(jwt)
      //         .then(user => {
      //           if (user.isAuthenticated) {
      //             if (user.isExpired) {
      //               socket.emit('tokenExpired', 1);
      //             } else {
      //               emitUser(socket, user, true);
      //             }
      //           } else {
      //             emitUnregisteredUser(socket);
      //           }
      //         });
      //     } else {
      //       emitUnregisteredUser(socket);
      //     }
      //   }

      //   socket.on('disconnect', () => {
      //     if (socket.userId) {
      //       delete io.userToSocketId[socket.userId];
      //     }
      //   });
      // });

      // strapi.io = io;
    }
  }, 200);   
};
