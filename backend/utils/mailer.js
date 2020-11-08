/* eslint-disable no-console */
/* eslint-disable camelcase */
const AWS = require("aws-sdk");

// The "From" address. This address has to be verified in Amazon Pinpoint
// in the region that you use to send email.
const senderAddress = "vacodoceo@uc.cl";

// The Amazon Pinpoint project/application ID to use when you send this message.
// Make sure that the SMS channel is enabled for the project or application
// that you choose.
const appId = "cea4871423fa4f0dba3f411a73ae3418";

// The subject line of the email.
const subject = "¡Te han mencionado en iic2173-g22!";

// The email body for recipients with non-HTML email clients.
const getBodyText = ({
  username,
  roomName,
}) => `Notificación desde nuestra entrega 1 de Arqui de Sistemas de Software
----------------------------------------------------
Estimado ${username}, acaban de mencionarte en la sala de chat ${roomName}. ¡Anda a echarle un vistazo!`;

// The body of the email for recipients whose email clients support HTML content.
const getBodyHtml = ({ username, roomName }) => `<html>
<head></head>
<body>
  <h1>Notificación desde nuestra entrega 1 de Arqui de Sistemas de Software</h1>
  <p>Estimado ${username}, acaban de mencionarte en la sala de chat ${roomName}. ¡Anda a echarle un vistazo!</p>
</body>
</html>`;

// The character encoding the you want to use for the subject line and
// message body of the email.
const charset = "UTF-8";

// Create a new Pinpoint object.
const pinpoint = new AWS.Pinpoint();

// Specify the parameters to pass to the API.
const getParams = ({ targetEmail, username, roomName }) => ({
  ApplicationId: appId,
  MessageRequest: {
    Addresses: {
      [targetEmail]: {
        ChannelType: "EMAIL",
      },
    },
    MessageConfiguration: {
      EmailMessage: {
        FromAddress: senderAddress,
        SimpleEmail: {
          Subject: {
            Charset: charset,
            Data: subject,
          },
          HtmlPart: {
            Charset: charset,
            Data: getBodyHtml({ username, roomName }),
          },
          TextPart: {
            Charset: charset,
            Data: getBodyText({ username, roomName }),
          },
        },
      },
    },
  },
});

const sendMailNotification = ({ targetEmail, username, roomName }) => {
  const params = getParams({ targetEmail, username, roomName });
  pinpoint.sendMessages(params, function (err, data) {
    // If something goes wrong, print an error message.
    if (err) {
      console.log(err.message);
    } else {
      console.log("Email sent! Message ID: ", data.MessageResponse);
    }
  });
};

exports.sendMailNotification = sendMailNotification;
