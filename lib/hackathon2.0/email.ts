import nodemailer from "nodemailer";

export const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || "587");
  // Port 465 requires secure: true, Port 587 requires secure: false (uses STARTTLS)
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendSubmissionConfirmationEmail(
  emails: string[],
  projectName: string
) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("SMTP not configured. Skipping submission confirmation email.");
    return false;
  }

  const mailOptions = {
    // using SMTP_USER as from, or a default
    from: `"Hackathon Organizer" <${process.env.SMTP_USER}>`,
    to: emails.join(", "),
    subject: `🎉 Project Submitted: ${projectName}`,
    text: `Congratulations!\n\nYour team's project "${projectName}" has been successfully submitted for the hackathon.\n\nYour project is currently being evaluated by our judges. If you need to make any changes to your submission, please reach out to an organizer.\n\nGood luck!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff9b7a;">Project Submitted! 🎉</h2>
        <p>Congratulations!</p>
        <p>Your team's project <strong>"${projectName}"</strong> has been successfully submitted for the hackathon.</p>
        <p>Your project is currently being evaluated by our judges. If you need to make any changes to your submission, please reach out to an organizer.</p>
        <br/>
        <p>Good luck!</p>
      </div>
    `,
  };

  try {
    console.log(`Attempting to send submission email to: ${emails.join(", ")}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Submission email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending submission email via nodemailer:", error);
    return false;
  }
}
