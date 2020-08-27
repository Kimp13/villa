const strapi = global.strapi;

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

module.exports = {
  findOne: async ctx => {
    let cookieString;

    try {
      cookieString = ctx.request.headers.cookie;

      if (!cookieString) {
        cookieString = '';
      }
    } catch(e) {
      cookieString = '';
    }

    let jwt;

    jwt = getCookie('jwt', cookieString);

    if (jwt) {
      try {
        let user = await strapi.plugins['users-permissions'].services.jwt.verify(jwt);

        user = await strapi.query('user', 'users-permissions').findOne({
          id: user.id
        });

        if (user) {
          ctx.send({
            isAuthenticated: true,
            isAnonymous: false,
            isRoot: (user.role.type === 'root'),
            id: user.id,
            name: user.name,
            surname: user.surname,
            phoneNumber: user.phoneNumber
          });
        } else {
          ctx.send({isAuthenticated: false});
        }
      } catch(e) {
        ctx.send({isAuthenticated: false});
      }
    } else {
      jwt = getCookie('jwta', cookieString);
      if (jwt) {
        let user = await strapi.plugins.villa.services.anon.verify(jwt);

        if (user.isAuthenticated && !user.isExpired) {
          ctx.send({
            isAuthenticated: true,
            isAnonymous: true,
            isRoot: false,
            id: user.id,
            name: user.name,
            surname: user.surname,
            phoneNumber: user.phoneNumber
          });
        } else {
          ctx.send(user);
        }
      } else {
        ctx.send({isAuthenticated: false});
      }
    }
  }
}