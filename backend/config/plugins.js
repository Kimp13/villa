module.exports = () => {
  return {
    email: {
      provider: 'nodemailer',
      providerOptions: {
        service: "Gmail",
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        }
      },
      settings: {
        defaultFrom: 'villafiolent@gmail.com'
      }
    }
  }
};