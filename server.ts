async function sendOtpEmail(recipientEmail: string, otpCode: string, recipientName: string): Promise<MailResult> {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').replace(/[^\x20-\x7E]/g, '').trim();
  const port = parseInt((process.env.SMTP_PORT || '465').replace(/\D/g, ''), 10);
  const user = (process.env.SMTP_USER || '').replace(/[^\x20-\x7E]/g, '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/[\r\n]/g, '').trim();

  // সার্ভার লগে কোড প্রিন্ট করে দেওয়া যাতে নেটওয়ার্ক ব্লক হলেও কোড পাওয়া যায়
  console.log(`\n========================================`);
  console.log(`[PASSWORD RECOVERY OTP CODE]: ${otpCode}`);
  console.log(`Target: ${recipientEmail} (${recipientName})`);
  console.log(`========================================\n`);

  if (!user || !pass) {
    return {
      success: false,
      error: 'SMTP credentials not configured in environment.'
    };
  }

  try {
    // জিমেইল সার্ভিস মোড এবং শর্ট টাইমআউট ব্যবহার করা
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 5000, // ৫ সেকেন্ডের বেশি আটকে থাকবে না
      greetingTimeout: 5000,
      socketTimeout: 5000,
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: `"E-Biddalay School Management" <${user}>`,
      to: recipientEmail,
      subject: 'E-Biddalay Password Recovery OTP Code',
      text: `Hello ${recipientName},\n\nYour one-time verification code is: ${otpCode}\nValid for 5 minutes.`,
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">E-Biddalay School Management</h2>
          <p>Your one-time verification code for password reset is:</p>
          <h1 style="color: #1e40af; letter-spacing: 5px;">${otpCode}</h1>
          <p style="color: red;">Valid for 5 minutes only.</p>
        </div>
      `
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('SMTP connection failed due to cloud network restrictions:', err.message);
    // Render-এর ক্লাউড পোর্ট ব্লকে আটকে না থেকে ফলব্যাক সক্রিয় করা
    return {
      success: false,
      error: err.message
    };
  }
}
