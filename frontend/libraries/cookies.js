function hasCookie(cookie) {
  let allCookies = document.cookie.split(';');
  
  for (let i = 0; i < allCookies.length; i += 1) {
    if (allCookies[i].substring(0, allCookies[i].indexOf('=')).trim() === cookie) {
      return true;
    }
  }

  return false;
}

export function deleteCookie(cookie) {
  document.cookie = `${cookie}=;path=/;Expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Strict`;
}

export function getCookie(cookie, cookieString) {
  if (cookieString === undefined) {
    cookieString = document.cookie;
  }

  let allCookies = cookieString.split(';');

  for (let i = 0; i < allCookies.length;  i += 1) {
    let equalsSignIndex = allCookies[i].indexOf('=');
    if (allCookies[i].substring(0, equalsSignIndex).trim() === cookie) {
      return allCookies[i].substring(equalsSignIndex + 1);
    }
  }

  return null;
}

export function setCookie(cookie, value, { maxAge, expires, path, httpOnly, sameSite } = {}) {
  let finalCookie;

  if (hasCookie(cookie)) {
    deleteCookie(cookie);
  }

  finalCookie = `${cookie}=${value}`;

  if (maxAge) {
    finalCookie += `; Max-Age=${maxAge}`;
  } else if (expires) {
    finalCookie += `; Expires=${expires}`;
  }

  if (path) {
    finalCookie += `; Path=${path}`;
  } else {
    finalCookie += `; Path=/`;
  }

  if (httpOnly) {
    finalCookie += `; HttpOnly`;
  }

  if (sameSite) {
    finalCookie += `; SameSite=${sameSite}`;
  } else {
    finalCookie += `; SameSite=Lax`;
  }

  document.cookie = finalCookie;
}