import { Request, Response, NextFunction } from 'express';
import { IUserUseCase } from '../useCases/User/IUserUseCase';
import { createUserSchema, updateUserSchema, idParamSchema } from '../infrastructure/validation/UserValidationSchemas';

// Controller - handles HTTP requests/responses, delegates business logic to use case
export class UserController {
  constructor(private userUseCase: IUserUseCase) {}

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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate ID parameter
      const { id } = await idParamSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      const user = await this.userUseCase.getById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: `User with ID ${id} not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userUseCase.getAll();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate ID parameter
      const { id } = await idParamSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      // Validate request body with Yup
      const validatedData = await updateUserSchema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });

      const user = await this.userUseCase.update(id, validatedData);
      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate ID parameter
      const { id } = await idParamSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      await this.userUseCase.delete(id);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      next(error); // Pass to error handling middleware
    }
  }
}
