let getAPIURL = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

let getFullLink = (path) => getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path;

let getAPIResponse = async (path, query=[], jwt=false) => {
  let queryString = query.reduce((currentString, parameter) => {
    if (currentString.length > 0) {
      return currentString + '&' + encodeURI(parameter.key) + '=' + encodeURI(parameter.value);
    } else {
      return currentString + encodeURI(parameter.key) + '=' + encodeURI(parameter.value);
    }
  }, '');
  let url = getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path + (queryString ? '?' : '') + queryString;
  let response = await fetch(url, {
    headers: jwt ? {
      'Authorization': 'Bearer ' + jwt
    } : {},
  });
  response = await response.json();
  return response;
};


module.exports = {
  getFullLink,
  getAPIResponse
}