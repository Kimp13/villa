module.exports = url => {
  let searchStart = url.indexOf('?'),
      query = new Object();

  if (searchStart === -1) {
    return false;
  }

  let search = url.substring(searchStart + 1);

  if (search.length === 0) {
    return false;
  }

  search = search.split('&');

  for (let i = 0; i < search.length; i += 1) {
    let pair = search[i].split('=');

    query[pair[0]] = pair[1];
  }

  return query;
};