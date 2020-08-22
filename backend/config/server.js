module.exports = ({ env }) => {
  if (env('NODE_ENV', 'production') === 'production') {
    return {
      host: env('HOST', '0.0.0.0'),
      port: env.int('PORT', 1337),
      url: 'https://villafiolent.ru/api',
      admin: {
        url: 'https://villafiolent.ru/dashboard',
        auth: {
          secret: env('ADMIN_JWT_SECRET', '72feaf4a1d553e8c4767a912c9872d32'),
        }
      }
    };
  } else {
    return {
      host: env('HOST', '0.0.0.0'),
      port: env.int('PORT', 1337),
      admin: {
        auth: {
          secret: env('ADMIN_JWT_SECRET', '72feaf4a1d553e8c4767a912c9872d32'),
        }
      }
    };
  }
};
