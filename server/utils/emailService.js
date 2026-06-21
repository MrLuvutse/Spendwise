const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBudgetAlert = async ({ to, name, category, spent, limit, percent }) => {
  const isExceeded = percent >= 100;

  const subject = isExceeded
    ? `🚨 Budget Exceeded — ${category}`
    : `⚠️ Budget Alert — ${category} at ${percent.toFixed(0)}%`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #22c55e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 SpendWise</h1>
      </div>

      <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">
          ${isExceeded ? '🚨 Budget Exceeded!' : '⚠️ Budget Warning'}
        </h2>
        <p style="color: #64748b; margin-bottom: 24px;">Hi ${name}, here's an update on your budget.</p>

        <div style="background: ${isExceeded ? '#fee2e2' : '#fef3c7'}; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 18px; font-weight: 700; color: ${isExceeded ? '#991b1b' : '#92400e'}; margin-bottom: 8px;">
            ${category}
          </div>
          <div style="color: #64748b; font-size: 14px; margin-bottom: 12px;">
            Spent <strong>$${spent.toLocaleString()}</strong> of <strong>$${limit.toLocaleString()}</strong> limit
          </div>

          <!-- Progress bar -->
          <div style="background: #e2e8f0; border-radius: 99px; height: 10px; overflow: hidden;">
            <div style="
              width: ${Math.min(percent, 100).toFixed(0)}%;
              height: 100%;
              background: ${isExceeded ? '#ef4444' : '#f59e0b'};
              border-radius: 99px;
            "></div>
          </div>
          <div style="text-align: right; font-size: 13px; font-weight: 700; color: ${isExceeded ? '#ef4444' : '#f59e0b'}; margin-top: 6px;">
            ${percent.toFixed(0)}%
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
          ${isExceeded
            ? `You have exceeded your ${category} budget by <strong>$${(spent - limit).toLocaleString()}</strong>. Consider reviewing your expenses.`
            : `You are approaching your ${category} budget limit. You have <strong>$${(limit - spent).toLocaleString()}</strong> remaining.`
          }
        </p>

        <a href="http://localhost:3000/budgets" style="
          display: inline-block;
          background: #22c55e;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        ">View Budgets →</a>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          SpendWise — Personal Finance Manager
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"SpendWise" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #22c55e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 SpendWise</h1>
      </div>

      <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">Welcome to SpendWise, ${name}! 🎉</h2>
        <p style="color: #64748b; margin-bottom: 24px;">
          Your account has been created successfully. Here's what you can do:
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: #dcfce7; padding: 14px; border-radius: 8px; color: #15803d;">
            📊 <strong>Track transactions</strong> — log your income and expenses
          </div>
          <div style="background: #dcfce7; padding: 14px; border-radius: 8px; color: #15803d;">
            🎯 <strong>Set budgets</strong> — get alerts before you overspend
          </div>
          <div style="background: #dcfce7; padding: 14px; border-radius: 8px; color: #15803d;">
            📈 <strong>View reports</strong> — visualize your spending patterns
          </div>
        </div>

        <a href="http://localhost:3000" style="
          display: inline-block;
          background: #22c55e;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin-top: 24px;
        ">Get Started →</a>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          SpendWise — Personal Finance Manager
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"SpendWise" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎉 Welcome to SpendWise!',
    html,
  });
};
const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <div style="background: #22c55e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 SpendWise</h1>
      </div>

      <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">Reset Your Password 🔐</h2>
        <p style="color: #64748b; margin-bottom: 24px;">
          Hi ${name}, we received a request to reset your SpendWise password.
          Click the button below to set a new password.
        </p>

        <a href="${resetUrl}" style="
          display: inline-block;
          background: #22c55e;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 24px;
        ">Reset Password →</a>

        <p style="color: #94a3b8; font-size: 13px;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, ignore this email.
        </p>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          SpendWise — Personal Finance Manager
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"SpendWise" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Reset Your SpendWise Password',
    html,
  });
};
module.exports = { sendBudgetAlert, sendWelcomeEmail, sendPasswordResetEmail };