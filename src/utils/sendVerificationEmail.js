import sgMail from "@sendgrid/mail";

const sendVerificationEmail = (email, firstname, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: `${email}`,
    from: "eliszewskipawel@gmail.com",
    subject: "Wallet App - Link weryfikacyjny / Verification link",
    html: `<strong>Witaj ${firstname}</strong>
    <p>W celu weryfikacji konta proszę kliknąć w poniższy link:</p>
      <a href="https://finance-app-wallet.netlify.app/verify/${verificationToken}">Zwryfikuj konto</a>
      <p>Pozdrawiam,</p>
      <br><br>
      <strong>Welcome, ${firstname}</strong>
      <p>To verify your account please click the following link:</p>
      <a href="https://finance-app-wallet.netlify.app/verify/${verificationToken}">Verify your account</a>
      <p>Best regards,</p>
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

export default sendVerificationEmail;
