import { Request, Response, NextFunction } from "express";
import { IUserUseCase } from "../useCases/user/IUserUseCase";
import { CreateUserDTO } from "../domain/dtos/user/CreateUserDTO";
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
      const validatedData = await signUpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.userUseCase.signUp(
        validatedData as CreateUserDTO,
      );
      return res.status(200).json(result);
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
      const validatedData = await verifyOtpSchema.validate(req.body, {
        abortEarly: false,
      });

      const result = await this.userUseCase.verifyOtp(
        validatedData.mobile,
        validatedData.otp,
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
}
