import { Request, Response, NextFunction } from "express";
import { IUserUseCase } from "../useCases/user/IUserUseCase";
import {
  signUpSchema,
  verifyOtpSchema,
  resendOtpSchema,
  signInSchema,
} from "../infrastructure/validation/user/UserValidationSchemas";

type UserControllerConstructorParams = {
  userUseCase: IUserUseCase;
};

export class UserController {
  private userUseCase: IUserUseCase;

  constructor({ userUseCase }: UserControllerConstructorParams) {
    this.userUseCase = userUseCase;
  }

  async signUp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedUserData = await signUpSchema.validate(req.body, {
        abortEarly: false,
      });

      await this.userUseCase.signUp(validatedUserData);
      return res.status(200).json({
        success: true,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedUserData = await verifyOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.userUseCase.verifyOtp(
        validatedUserData
      );
      return res.status(200).json({
        success: true,
        data: result,
        message: "Verification successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedData = await resendOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.userUseCase.resendOtp(validatedData.mobile);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async signIn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedData = await signInSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.userUseCase.signIn(validatedData.mobile);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkAuth(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      if (!req.user || !req.user.mobile) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized token payload",
        });
      }

      const user = await this.userUseCase.getUserByMobile(req.user.mobile);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found in database",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          role: user.role,
          mobile: user.mobile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
