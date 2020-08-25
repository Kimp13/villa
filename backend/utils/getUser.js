const strapi = global.strapi;

module.exports = async auth => {
  if (auth.jwt) {
    try {
      user = await strapi.plugins['users-permissions'].services.jwt.verify(auth.jwt);
    } catch(e) {
      return false;
    }

    user.id = String(user.id);
  } else if (auth.jwta) {
    user = await strapi.plugins.villa.services.anon.verify(auth.jwta);

    if (!user.isAuthenticated) {
      return false;
    }

    user.id = `anon${user.id}`;
  } else {
    return false;
  }

  return user;
}