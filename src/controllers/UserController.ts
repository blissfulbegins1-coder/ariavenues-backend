import { Request, Response, NextFunction } from 'express';
import { IUserUseCase } from '../useCases/user/IUserUseCase';
import { createUserSchema } from '../infrastructure/validation/user/UserValidationSchemas';

type UserControllerConstructorParams = {
  UserUseCase: IUserUseCase;
};

export class UserController {
  private userUseCase: IUserUseCase;

  constructor({ UserUseCase }: UserControllerConstructorParams) {
    this.userUseCase = UserUseCase;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Yup
      const validatedData = await createUserSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const user = await this.userUseCase.create(validatedData);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }
}
