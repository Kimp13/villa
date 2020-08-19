'use strict';

module.exports = ctx => {
  try {
    if (ctx.request.headers['custom-authorization'].substring(0, 4) === 'Anon') {
      return {
        jwta: ctx.request.headers['custom-authorization'].substring(5)
      }
    } else {
      return {
        jwt: ctx.request.headers['custom-authorization']
      }
    }
  } catch(e) {
    console.log(e);
    return new Object();
  }
}