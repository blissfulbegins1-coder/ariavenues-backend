import { auth_Key, baseUrl, templateId, otpTimeout } from '../../../domain/constants/constants';
import { InvalidUserDataError } from '../../../domain/errors/UserErrors';

export class OtpService {
  /**
   * Send OTP via MSG91
   * @param mobile Mobile number with country code (e.g., "91XXXXXXXXXX")
   */
  async sendOtp(mobile: string): Promise<boolean> {
    if (auth_Key === 'mock' || !auth_Key) {
      console.log(`[MOCK OTP SERVICE] OTP sent to ${mobile} (Template ID: ${templateId})`);
      return true;
    }

    const url = `${baseUrl}?template_id=${encodeURIComponent(templateId || '')}&mobile=${encodeURIComponent(mobile)}&otp_expiry=${encodeURIComponent(otpTimeout)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'authkey': auth_Key,
          'content-type': 'application/json',
        },
      });

      const result = await response.json() as any;
      if (result.type === 'success') {
        return true;
      }
      throw new Error(result.message || 'Failed to send OTP via MSG91');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(`OTP send failed: ${error.message}`);
    }
  }

  /**
   * Verify OTP via MSG91
   * @param mobile Mobile number with country code (e.g., "91XXXXXXXXXX")
   * @param otp The verification code
   */
  async verifyOtp(mobile: string, otp: string): Promise<boolean> {
    if (auth_Key === 'mock' || !auth_Key) {
      if (otp === '123456') {
        console.log(`[MOCK OTP SERVICE] OTP verified successfully for ${mobile}`);
        return true;
      }
      throw new InvalidUserDataError('Invalid mock OTP. Use 123456');
    }

    let verifyUrl = baseUrl;
    if (baseUrl.endsWith('/otp')) {
      verifyUrl = baseUrl.replace(/\/otp$/, '/otp/verify');
    } else if (baseUrl.endsWith('/otp/')) {
      verifyUrl = baseUrl.replace(/\/otp\/$/, '/otp/verify');
    } else {
      verifyUrl = `${baseUrl}/verify`;
    }

    const url = `${verifyUrl}?otp=${encodeURIComponent(otp)}&mobile=${encodeURIComponent(mobile)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'authkey': auth_Key,
        },
      });

      const result = await response.json() as any;
      if (result.type === 'success') {
        return true;
      }
      throw new InvalidUserDataError(result.message || 'Invalid OTP');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }
}
