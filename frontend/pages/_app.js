import Layout from "../components/Layout";

import React from "react";
import App from "next/app";
import { getCookie } from "../libraries/cookies.js";
import { getAPIResponse } from "../libraries/requests.js";

import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

export default class MyApp extends App {
  static async getInitialProps({ ctx }) {
    let pageProps = {},
        getAnonymousUser = async anonymousId => {
          let userResponse = await getAPIResponse('/villa-user-management/getAnonymousUser', [
            {
              key: 'userId',
              value: anonymousId
            }
          ]);
          if(userResponse.length === 0) {
            return {
              isAuthenticated: false
            }
          } else {
            return {
              ...userResponse,
              id: anonymousId,
              isAuthenticated: true,
              isAnonymous: true
            }
          }
        },
        getUserByJWT = async jwt => {
          let userResponse = await getAPIResponse('/villa-user-management/getUserByJWT', [], jwt);
          return userResponse.error ? {
            isAuthenticated: false
          } : {
            ...userResponse._doc,
            jwt,
            isRoot: userResponse.isRoot,
            isAuthenticated: true,
            isAnonymous: false
          };
        };

    let cookies = (ctx.req ? (ctx.req.headers.cookie || '') : ''),
        jwt = getCookie('jwt', cookies),
        anonymousId,
        userResponse,
        user;

    if (jwt) {
      user = await getUserByJWT(jwt);
    } else {
      anonymousId = getCookie('a', cookies);
      if (anonymousId) {
        user = await getAnonymousUser(anonymousId);
      } else {
        user = {
          isAuthenticated: false
        }
      }
    }
    
    return { pageProps, user };
  }

  render() {
    const { Component, pageProps, user } = this.props;
    return (
      <Layout user={user} {...pageProps}>
        <Component {...pageProps}/>
      </Layout>
    );
  }
}