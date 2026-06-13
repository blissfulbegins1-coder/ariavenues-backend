import { Request, Response, NextFunction } from 'express';
import { IUserUseCase } from '../useCases/user/IUserUseCase';
import { CreateUserDTO } from '../domain/dtos/user/CreateUserDTO';
import {
  signUpSchema,
  verifyOtpSchema,
  resendOtpSchema,
  signInSchema,
  verifySignInOtpSchema,
} from '../infrastructure/validation/user/UserValidationSchemas';


type UserControllerConstructorParams = {
  userUseCase: IUserUseCase;
};

export class UserController {
  private userUseCase: IUserUseCase;

  constructor({ userUseCase }: UserControllerConstructorParams) {
    this.userUseCase = userUseCase;
  }

  /**
   * Initiate signup and send OTP
   */
  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Yup
      const validatedData = await signUpSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const result = await this.userUseCase.signUp(validatedData as CreateUserDTO);
      res.status(200).json(result);
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  /**
   * Verify OTP and complete signup
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Yup
      const validatedData = await verifyOtpSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const result = await this.userUseCase.verifyOtp(validatedData.mobile, validatedData.otp);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered and mobile verified successfully',
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  /**
   * Resend OTP
   */
  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Yup
      const validatedData = await resendOtpSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const result = await this.userUseCase.resendOtp(validatedData.mobile);
      res.status(200).json(result);
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  /**
   * Initiate sign in and send OTP
   */
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = await signInSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const result = await this.userUseCase.signIn(validatedData.mobile);
      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Verify sign in OTP and return navigation route
   */
  async verifySignInOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = await verifySignInOtpSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const result = await this.userUseCase.verifySignInOtp(validatedData.mobile, validatedData.otp);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Sign in successful',
      });
    } catch (error: any) {
      next(error);
    }
  }
}


