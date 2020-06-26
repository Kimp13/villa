let getAPIURL = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

let getFullLink = (path) => getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path;

let getAPIResponse = async (path, query) => {
  let queryString = query.reduce((currentString, parameter) => {
    return '&' + currentString + encodeURI(parameter.key) + '=' + encodeURI(parameter.value);
  }, '');
  let url = getAPIURL() + (path.charAt(0) === '/' ? '' : '/') + path + '?' + queryString;
  let response = await fetch(url);
  response = await response.json();
  return response;
};


module.exports = {
  getFullLink,
  getAPIResponse
}