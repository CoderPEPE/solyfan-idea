import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendPaymentSuccessEmail(
    email: string, 
    amount: number, 
    currency: string, 
    transactionId: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Payment Successful - SolyFans',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Payment Successful!</h2>
            <p>Dear valued member,</p>
            <p>Your payment has been processed successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Payment Details:</h3>
              <p><strong>Amount:</strong> ${amount} ${currency}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for your payment. You can now enjoy premium content from your favorite creators.</p>
            
            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The SolyFans Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Payment success email sent to ${email}`);
    } catch (error) {
      console.error('Error sending payment success email:', error);
    }
  }

  async sendSubscriptionEmail(
    email: string,
    type: 'monthly' | 'annual',
    amount: number,
    creatorEmail: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Subscription Activated - SolyFans',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Subscription Activated!</h2>
            <p>Dear subscriber,</p>
            <p>Your subscription has been activated successfully.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Subscription Details:</h3>
              <p><strong>Creator:</strong> ${creatorEmail}</p>
              <p><strong>Plan:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Subscription</p>
              <p><strong>Amount:</strong> $${amount} USD</p>
              <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>You now have access to exclusive content from this creator. Enjoy!</p>
            
            <p>You can manage your subscriptions in your account settings at any time.</p>
            
            <p>Best regards,<br>The SolyFans Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Subscription email sent to ${email}`);
    } catch (error) {
      console.error('Error sending subscription email:', error);
    }
  }

  async sendWelcomeEmail(email: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to SolyFans!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome to SolyFans!</h2>
            <p>Dear new member,</p>
            <p>Thank you for joining SolyFans! We're excited to have you as part of our community.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Getting Started:</h3>
              <ul>
                <li>Complete your profile to get started</li>
                <li>Discover amazing creators and their content</li>
                <li>Subscribe to your favorite creators</li>
                <li>Start creating and sharing your own content</li>
              </ul>
            </div>
            
            <p>If you have any questions, our support team is here to help.</p>
            
            <p>Welcome aboard!<br>The SolyFans Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

export default new EmailService();