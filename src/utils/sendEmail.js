import sgMail from "@sendgrid/mail";

const sendEmail = (email, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: `${email}`,
    from: "eliszewskipawel@gmail.com",
    subject: "Wallet App - Link weryfikacyjny / Verification link",
    html: `<p>W celu weryfikacji konta proszę kliknąć w poniższy link:</p>
      <a href="https://finance-app-wallet.netlify.app/verify/${verificationToken}">Zwryfikuj konto</a>
      <br><br>
      <p>To verify your account please click the following link:</p>
      <a href="https://finance-app-wallet.netlify.app/verify/${verificationToken}">Verify your account</a>
    `,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

export default sendEmail;
