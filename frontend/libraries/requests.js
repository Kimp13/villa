let getAPIURL = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

let getFullLink = (path) => getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path;

let getApiResponse = async (path, query = false, jwt = false) => {
  let keys = Object.keys(query),
      queryString = '';

  if (query) {
    queryString = `?${keys[0]}=${query[keys[0]]}`;
  }

  for (let i = 1; i < keys.length; i += 1) {
    queryString += `&${keys[i]}=${query[keys[i]]}`;
  }

  let url = encodeURI(getFullLink(path) + queryString);

  let response = await fetch(url, {
    headers: jwt ? {
      'Authorization': 'Bearer ' + jwt
    } : {},
  });

  return await response.json();
};


module.exports = {
  getFullLink,
  getApiResponse
}