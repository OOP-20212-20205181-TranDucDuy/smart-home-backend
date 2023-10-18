import { MailerOptions } from '@nestjs-modules/mailer';

export const configNodeMailer = () => {
  const nodemailer: MailerOptions = {
    transport: {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        accessToken: process.env.OAUTH_ACCESS_TOKEN,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    },
  };

  return nodemailer;
};