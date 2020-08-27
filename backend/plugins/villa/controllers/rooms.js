const strapi = global.strapi,
      stj = require("../../../utils/searchToJson");

module.exports = {
  find: async ctx => {
    const body = stj(ctx.request.url);

    if (body.name) {
      body.name = decodeURI(body.name);
    }

    let rooms = await strapi.query('room').find(body);

    for (let room of rooms) {
      delete room.created_by;
      delete room.updated_by;
      delete room.created_at;
      delete room.updated_at;

      room.description =
        strapi
          .parseMD(room.description)
          .replace(/<ul>/g, '<ul class="ul">')
          .replace(/<li>/g, '<li class="li">');

      for (let i = 0; i < room.images.length; i += 1) {
        room.images[i] = {
          url: process.env.API_URL + room.images[i].url,
          thumbnail: process.env.API_URL + room.images[i].formats.thumbnail.url,
          small: process.env.API_URL + room.images[i].formats.small.url,
          medium: process.env.API_URL + room.images[i].formats.medium.url,
          width: room.images[i].width,
          height: room.images[i].height
        }
      }
    }

    ctx.send(rooms);
  }
};