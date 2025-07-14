import { hashPassword, comparePassword, generateToken, verifyToken } from '../../src/utils/auth';
import jwt from 'jsonwebtoken';

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'samepassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      expect(hashedPassword).toBeDefined();
    });

    it('should handle special characters in password', async () => {
      const password = 'p@ssw0rd!@#$%^&*()';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctpassword';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'correctpassword';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'CaseSensitive';
      const hashedPassword = await hashPassword(password);
      
      const isValid1 = await comparePassword('CaseSensitive', hashedPassword);
      const isValid2 = await comparePassword('casesensitive', hashedPassword);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const hashedEmpty = await hashPassword('');
      
      const isValid1 = await comparePassword('', hashedEmpty);
      const isValid2 = await comparePassword('nonempty', hashedEmpty);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(false);
    });

    it('should handle malformed hash', async () => {
      const password = 'testpassword';
      const malformedHash = 'not-a-valid-hash';
      
      await expect(comparePassword(password, malformedHash)).rejects.toThrow();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should include payload in token', () => {
      const payload = { id: 'user123', email: 'test@example.com', role: 'creator' };
      const token = generateToken(payload);
      
      // Decode without verification to check payload
      const decoded = jwt.decode(token) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should set expiration time', () => {
      const payload = { id: 'user123' };
      const token = generateToken(payload);
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should handle empty payload', () => {
      const token = generateToken({});
      expect(token).toBeDefined();
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => generateToken({ id: 'test' })).toThrow('JWT_SECRET environment variable is not set');
      
      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      // Create token with different secret
      const wrongToken = jwt.sign({ id: 'user123' }, 'wrong-secret');
      expect(() => verifyToken(wrongToken)).toThrow();
    });

    it('should throw error for expired token', () => {
      const payload = { id: 'user123' };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '-1s' });
      
      expect(() => verifyToken(expiredToken)).toThrow();
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => verifyToken('any.token.here')).toThrow('JWT_SECRET environment variable is not set');
      
      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });

    it('should handle token without bearer prefix', () => {
      const payload = { id: 'user123' };
      const token = generateToken(payload);
      
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full auth cycle: hash → compare → token → verify', async () => {
      const password = 'integration-test-password';
      const userPayload = { id: 'user123', email: 'integration@test.com', role: 'creator' };
      
      // 1. Hash password
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeDefined();
      
      // 2. Compare password (login simulation)
      const isPasswordValid = await comparePassword(password, hashedPassword);
      expect(isPasswordValid).toBe(true);
      
      // 3. Generate token after successful login
      const token = generateToken(userPayload);
      expect(token).toBeDefined();
      
      // 4. Verify token (middleware simulation)
      const decodedPayload = verifyToken(token);
      expect(decodedPayload.id).toBe(userPayload.id);
      expect(decodedPayload.email).toBe(userPayload.email);
      expect(decodedPayload.role).toBe(userPayload.role);
    });

    it('should fail auth cycle with wrong password', async () => {
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';
      const userPayload = { id: 'user123', email: 'test@example.com' };
      
      // Hash correct password
      const hashedPassword = await hashPassword(correctPassword);
      
      // Try to login with wrong password
      const isPasswordValid = await comparePassword(wrongPassword, hashedPassword);
      expect(isPasswordValid).toBe(false);
      
      // Should not generate token for failed login
      // In real app, this would be handled in the controller
    });

    it('should handle concurrent password operations', async () => {
      const passwords = ['pass1', 'pass2', 'pass3', 'pass4', 'pass5'];
      
      // Hash multiple passwords concurrently
      const hashPromises = passwords.map(pass => hashPassword(pass));
      const hashedPasswords = await Promise.all(hashPromises);
      
      // Verify all hashes are different
      const uniqueHashes = new Set(hashedPasswords);
      expect(uniqueHashes.size).toBe(passwords.length);
      
      // Compare all passwords concurrently
      const comparePromises = passwords.map((pass, index) => 
        comparePassword(pass, hashedPasswords[index])
      );
      const compareResults = await Promise.all(comparePromises);
      
      // All comparisons should be true
      expect(compareResults.every(result => result === true)).toBe(true);
    });

    it('should handle token expiration scenarios', () => {
      const payload = { id: 'user123' };
      
      // Create token with short expiration
      const shortToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1ms' });
      
      // Wait a bit and try to verify
      setTimeout(() => {
        expect(() => verifyToken(shortToken)).toThrow();
      }, 10);
      
      // Create token with long expiration
      const longToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      const decoded = verifyToken(longToken);
      expect(decoded.id).toBe(payload.id);
    });
  });

  describe('Security Tests', () => {
    it('should generate cryptographically strong hashes', async () => {
      const password = 'test-password';
      const hashes = [];
      
      // Generate multiple hashes of the same password
      for (let i = 0; i < 10; i++) {
        hashes.push(await hashPassword(password));
      }
      
      // All hashes should be unique (very high probability)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
      
      // All hashes should be valid for the original password
      const validations = await Promise.all(
        hashes.map(hash => comparePassword(password, hash))
      );
      expect(validations.every(valid => valid === true)).toBe(true);
    });

    it('should not leak information through timing attacks', async () => {
      const password = 'test-password';
      const hashedPassword = await hashPassword(password);
      
      // These operations should take similar time regardless of input
      const start1 = Date.now();
      await comparePassword('wrong-password', hashedPassword);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await comparePassword('another-wrong-password', hashedPassword);
      const time2 = Date.now() - start2;
      
      // Times should be roughly similar (within reasonable tolerance)
      // This is a basic check - real timing attack prevention requires more sophisticated analysis
      const timeDifference = Math.abs(time1 - time2);
      expect(timeDifference).toBeLessThan(100); // 100ms tolerance
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hashedPassword = await hashPassword(longPassword);
      
      expect(hashedPassword).toBeDefined();
      
      const isValid = await comparePassword(longPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters in passwords', async () => {
      const unicodePassword = '测试密码🔐💎🚀';
      const hashedPassword = await hashPassword(unicodePassword);
      
      expect(hashedPassword).toBeDefined();
      
      const isValid = await comparePassword(unicodePassword, hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});