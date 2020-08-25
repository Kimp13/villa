const strapi = global.strapi;

module.exports = {
  verify: async jwt => {
    if (jwt) {
      const anon = await strapi.query('anonymoususer').findOne({
        jwt
      });

      if (anon) {
        if (Date.now() - anon.created_at.getTime() < 2592000000) {
          return Object.assign({
            isAuthenticated: true
          }, anon);
        } else {
          return Object.assign({
            isAuthenticated: true,
            isExpired: true
          }, anon);
        }
      }
    }

    return {
      isAuthenticated: false
    };
  }
}