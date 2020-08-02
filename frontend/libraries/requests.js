let getAPIURL = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

let getFullLink = path => getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path;

let getApiResponse = async (path, query) => {
  let keys,
      queryString = '';

  if (query) {
    keys = Object.keys(query);
    queryString = `?${keys[0]}=${query[keys[0]]}`;
  } else {
    keys = new Array();
  }

  for (let i = 1; i < keys.length; i += 1) {
    queryString += `&${keys[i]}=${query[keys[i]]}`;
  }

  let url = encodeURI(getFullLink(path) + queryString);

  let response = await fetch(url);

  return await response.json();
};

let postApi = async (path, query) => {
  query = JSON.stringify(query);

  let url = getFullLink(path),
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: query
      });

  return response;
};


module.exports = {
  getFullLink,
  getApiResponse,
  postApi
}