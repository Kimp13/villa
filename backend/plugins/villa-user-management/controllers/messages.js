const strapi = require('strapi');

module.exports = {
  async find(ctx) {
    let search = ctx.req.url.substring(ctx.req.url.indexOf('?') + 1),
        query = {},
        params = search.split('&'),
        skip,
        limit;

    for (let i = 0; i < params.length; i += 1) {
      let equalsSignIndex = params[i].indexOf('='),
          key = params[i].substring(0, equalsSignIndex),
          value = params[i].substring(equalsSignIndex + 1);
      if (key === 'conversationId') {
        query.conversationId = value;
      } else if (key === 'from') {
        skip = parseInt(value);
      } else if (key === 'count') {
        limit = parseInt(value);
      } else {
        ctx.throw(401);
        return;
      }
    }

    if (!query.conversationId) {
      ctx.throw(401);
    }

    let response = await strapi.models.message.find(query).limit(limit || 10).skip(skip || 0);

    for (let i = 0; i < response.length; i += 1) {
      response[i] = {
        type: response[i].type,
        text: response[i].text,
        attachments: response[i].attachments
      }
    }

    ctx.send(JSON.stringify(response));
  },
  async count(ctx) {
    let search = ctx.req.url.substring(ctx.req.url.indexOf('?') + 1);

    if (search.indexOf('&') !== -1) {
      ctx.throw(401);
    } else {
      let equalsSignIndex = search.indexOf('='),
          key = search.substring(0, equalsSignIndex);

      if (key !== 'conversationId') {
        ctx.throw(401);
      } else {
        let value = search.substring(equalsSignIndex + 1);
        let response = await strapi.models.message.countDocuments({conversationId: value});
        ctx.send(JSON.stringify({
          count: response
        }));
      }
    }
  }
}