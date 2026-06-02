import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

interface User {
  name: string | null;
  email: string;
}

interface Event {
  title: string;
  date: Date;
  location: string;
}

export async function sendRegistrationConfirmation(user: User, event: Event, eventId: string) {
  const formattedDate = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kyiv',
  }).format(new Date(event.date));

  const displayName = user.name ?? user.email;
  const eventUrl = `${process.env.NEXTAUTH_URL}/events/${eventId}`;

  await transporter.sendMail({
    from: 'Podiia <noreply@podiia.com>',
    to: user.email,
    subject: `Реєстрацію підтверджено: ${event.title}`,
    html: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#FEFBF0;font-family:sans-serif;">
  <div style="font-family:sans-serif;background:#FEFBF0;padding:40px 20px;">
    <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

      <!-- Header -->
      <div style="padding:24px 32px;border-bottom:3px solid #FFD84D;">
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;">
          Pod<span style="color:#7BAAE8;">i</span><span style="color:#FFD84D;">i</span>a
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">
          ПІДТВЕРДЖЕННЯ РЕЄСТРАЦІЇ
        </p>
        <h2 style="color:#111827;font-size:22px;margin:0 0 24px;">
          ${event.title}
        </h2>
        <p style="color:#374151;font-size:16px;margin:0 0 12px;">
          Привіт, <strong>${displayName}</strong>!
        </p>
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">
          Вашу реєстрацію підтверджено. Чекаємо вас на заході!
        </p>

        <!-- Event details box -->
        <div style="background:#FEFBF0;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #FFD84D;">
          <p style="margin:0 0 8px;color:#111827;">
            📅 <strong>${formattedDate}</strong>
          </p>
          <p style="margin:0;color:#6B7280;">
            📍 ${event.location}
          </p>
        </div>

        <!-- CTA Button -->
        <a href="${eventUrl}"
           style="display:inline-block;background:#7BAAE8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Переглянути захід →
        </a>
      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;background:#F9FAFB;border-top:1px solid #F3F4F6;">
        <p style="margin:0;color:#9CA3AF;font-size:13px;">
          © 2026 Podiia · Платформа соціальних і наукових заходів
        </p>
      </div>

    </div>
  </div>
</body>
</html>`,
  });
}
