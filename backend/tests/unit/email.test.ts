import emailService from '../../src/services/emailService';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 Message queued'
    })
  })
}));

describe('Email Service', () => {
  let mockTransporter: any;

  beforeEach(() => {
    const nodemailer = require('nodemailer');
    mockTransporter = nodemailer.createTransport();
    jest.clearAllMocks();
  });

  describe('sendPaymentSuccessEmail', () => {
    it('should send payment success email with correct content', async () => {
      const email = 'user@example.com';
      const amount = 19.99;
      const currency = 'USD';
      const transactionId = 'txn_12345';

      await emailService.sendPaymentSuccessEmail(email, amount, currency, transactionId);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Payment Successful - SolyFans');
      expect(callArgs.html).toContain('Payment Successful!');
      expect(callArgs.html).toContain(`${amount} ${currency}`);
      expect(callArgs.html).toContain(transactionId);
      expect(callArgs.html).toContain(new Date().toLocaleDateString());
    });

    it('should handle email sending errors gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

      // Should not throw error
      await expect(
        emailService.sendPaymentSuccessEmail('user@example.com', 10, 'USD', 'txn_123')
      ).resolves.toBeUndefined();

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should format amounts correctly', async () => {
      await emailService.sendPaymentSuccessEmail('user@example.com', 0.99, 'EUR', 'txn_123');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('0.99 EUR');
    });
  });

  describe('sendSubscriptionEmail', () => {
    it('should send monthly subscription email', async () => {
      const email = 'subscriber@example.com';
      const type = 'monthly';
      const amount = 9.99;
      const creatorEmail = 'creator@example.com';

      await emailService.sendSubscriptionEmail(email, type, amount, creatorEmail);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Subscription Activated - SolyFans');
      expect(callArgs.html).toContain('Subscription Activated!');
      expect(callArgs.html).toContain('Monthly Subscription');
      expect(callArgs.html).toContain(creatorEmail);
      expect(callArgs.html).toContain(`$${amount} USD`);
      expect(callArgs.html).toContain(new Date().toLocaleDateString());
    });

    it('should send annual subscription email', async () => {
      const email = 'subscriber@example.com';
      const type = 'annual';
      const amount = 99.99;
      const creatorEmail = 'creator@example.com';

      await emailService.sendSubscriptionEmail(email, type, amount, creatorEmail);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Annual Subscription');
      expect(callArgs.html).toContain('$99.99 USD');
    });

    it('should capitalize subscription type correctly', async () => {
      await emailService.sendSubscriptionEmail(
        'user@example.com', 
        'monthly', 
        10, 
        'creator@example.com'
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Monthly Subscription');
      expect(callArgs.html).not.toContain('monthly Subscription');
    });

    it('should handle email sending errors gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        emailService.sendSubscriptionEmail('user@example.com', 'monthly', 10, 'creator@example.com')
      ).resolves.toBeUndefined();

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct content', async () => {
      const email = 'newuser@example.com';

      await emailService.sendWelcomeEmail(email);

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(email);
      expect(callArgs.subject).toBe('Welcome to SolyFans!');
      expect(callArgs.html).toContain('Welcome to SolyFans!');
      expect(callArgs.html).toContain('Complete your profile');
      expect(callArgs.html).toContain('Discover amazing creators');
      expect(callArgs.html).toContain('Subscribe to your favorite creators');
      expect(callArgs.html).toContain('Start creating and sharing');
    });

    it('should include getting started instructions', async () => {
      await emailService.sendWelcomeEmail('user@example.com');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Getting Started:');
      expect(callArgs.html).toContain('<ul>');
      expect(callArgs.html).toContain('<li>');
    });

    it('should handle email sending errors gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Invalid email address'));

      await expect(
        emailService.sendWelcomeEmail('invalid-email')
      ).resolves.toBeUndefined();

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email Configuration', () => {
    it('should use correct email configuration', () => {
      const nodemailer = require('nodemailer');
      
      // Check that createTransport was called with correct config
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    });

    it('should set correct sender in all emails', async () => {
      await emailService.sendWelcomeEmail('test@example.com');
      await emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123');
      await emailService.sendSubscriptionEmail('test@example.com', 'monthly', 10, 'creator@example.com');

      // Check all three calls
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
      
      mockTransporter.sendMail.mock.calls.forEach(call => {
        expect(call[0].from).toBe(process.env.EMAIL_USER);
      });
    });
  });

  describe('Email Content Validation', () => {
    it('should include proper HTML structure in all emails', async () => {
      const emails = [
        () => emailService.sendWelcomeEmail('test@example.com'),
        () => emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123'),
        () => emailService.sendSubscriptionEmail('test@example.com', 'monthly', 10, 'creator@example.com')
      ];

      for (const emailFn of emails) {
        await emailFn();
        const lastCall = mockTransporter.sendMail.mock.calls[mockTransporter.sendMail.mock.calls.length - 1];
        const html = lastCall[0].html;
        
        // Check for proper HTML structure
        expect(html).toContain('<div');
        expect(html).toContain('font-family: Arial, sans-serif');
        expect(html).toContain('The SolyFans Team');
        expect(html).toMatch(/<h\d/); // Should have headers
        expect(html).toContain('<p>'); // Should have paragraphs
      }
    });

    it('should include consistent branding in all emails', async () => {
      const emails = [
        () => emailService.sendWelcomeEmail('test@example.com'),
        () => emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123'),
        () => emailService.sendSubscriptionEmail('test@example.com', 'monthly', 10, 'creator@example.com')
      ];

      for (const emailFn of emails) {
        await emailFn();
        const lastCall = mockTransporter.sendMail.mock.calls[mockTransporter.sendMail.mock.calls.length - 1];
        const html = lastCall[0].html;
        
        expect(html).toContain('SolyFans');
        expect(html).toContain('The SolyFans Team');
      }
    });

    it('should include support information in relevant emails', async () => {
      await emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123');
      await emailService.sendWelcomeEmail('test@example.com');

      mockTransporter.sendMail.mock.calls.forEach(call => {
        const html = call[0].html;
        expect(html).toContain('support');
      });
    });
  });

  describe('Error Logging', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log payment email errors', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Payment email error'));

      await emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending payment success email:',
        expect.any(Error)
      );
    });

    it('should log subscription email errors', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Subscription email error'));

      await emailService.sendSubscriptionEmail('test@example.com', 'monthly', 10, 'creator@example.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending subscription email:',
        expect.any(Error)
      );
    });

    it('should log welcome email errors', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Welcome email error'));

      await emailService.sendWelcomeEmail('test@example.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending welcome email:',
        expect.any(Error)
      );
    });

    it('should log successful email sends', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await emailService.sendWelcomeEmail('test@example.com');
      await emailService.sendPaymentSuccessEmail('test@example.com', 10, 'USD', 'txn_123');
      await emailService.sendSubscriptionEmail('test@example.com', 'monthly', 10, 'creator@example.com');

      expect(consoleSpy).toHaveBeenCalledWith('Welcome email sent to test@example.com');
      expect(consoleSpy).toHaveBeenCalledWith('Payment success email sent to test@example.com');
      expect(consoleSpy).toHaveBeenCalledWith('Subscription email sent to test@example.com');

      consoleSpy.mockRestore();
    });
  });
});