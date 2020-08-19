const strapi = global.strapi,
      showdown = require('showdown'),
      searchToJson = require("../../../utils/searchToJson");

showdown.setOption('noHeaderId', true);
showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('strikethrough', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('emoji', true);
showdown.setOption('underline', true);

const parser = new showdown.Converter({
  noHeaderId: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  openLinksInNewWindow: true,
  emoji: true,
  underline: true
});

function makeDateString(date) {
  let string = new String();
  string += date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate();
  string += '.';
  string += date.getUTCMonth() < 9 ? '0' +
  (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1);
  string += '.';
  string += date.getUTCFullYear();
  string += ' в ';
  string += date.getUTCHours();
  string += ':';
  string += date.getUTCMinutes();
  return string;
}

module.exports = {
  find: async ctx => {
    let search;

    try {
      search = searchToJson(ctx.request.url);
      if (search === false) {
        ctx.status = 400;
        return;
      }
    } catch(e) {
      console.log(e);
      ctx.status = 400;
      return;
    }

    let news = await strapi.query('new').find({
      _start: search._start,
      _limit: 10,
      _sort: 'created_at:desc'
    });

    for (let i = 0; i < news.length; i += 1) {
      let author, time = new Date();

      news[i].created_at.setTime(
        news[i].created_at.getTime() - 
          (Number(search.timezoneOffset) || 0)
      );
      time = ', ' + makeDateString(news[i].created_at);

      author = news[i].created_by.firstname + ' ' +
        news[i].created_by.lastname;

      news[i] = {
        author: author + time,
        header: news[i].header,
        text: parser.makeHtml(news[i].text)
          .replace(
            /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g,
            "<span class=\"emoji\">$&</span>"
          )
          .replace(
            /src="((\/.+?)+?)"/g,
            `src="${process.env.API_URL || 'http://localhost:1337'}$1"`
          )
      }
    }

    ctx.status = 200;
    ctx.send(news);
    return;
  }
}