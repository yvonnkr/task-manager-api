const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'yvonnkr86@gmail.com',
    subject: 'Thanks for Joining in',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    // html: '<strong>Hope all goes well.</strong>'
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'yvonnkr86@gmail.com',
    subject: 'Sorry to see you leave',
    text: `Goodbye ${name}. Hope to see you sometime soon. Please let us know if there is anything we could have done to have kept you on.`
    // html: '<strong>Hope all goes well.</strong>'
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};
