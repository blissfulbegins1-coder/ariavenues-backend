import { Request, Response, NextFunction } from "express";
import { IUserUseCase } from "../useCases/user/IUserUseCase";
import {
  signUpSchema,
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

      const result = await this.userUseCase.signUp(validatedUserData);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Account created successfully",
      });
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
      return res.status(200).json({
        success: true,
        data: result,
        message: "Sign in successful",
      });
    } catch (error) {
      next(error);
    }
  }
}
