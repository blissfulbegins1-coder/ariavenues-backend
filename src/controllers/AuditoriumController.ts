import { Request, Response, NextFunction } from 'express';
import { IAuditoriumUseCase } from '../useCases/auditorium/IAuditoriumUseCase';
import { CreateAuditoriumDTO } from '../domain/dtos/auditorium/CreateAuditoriumDTO';
import { createAuditoriumSchema } from '../infrastructure/validation/auditorium/AuditoriumValidationSchemas';
import UserTokenDto from '../domain/dtos/user/UserTokenDto';

type AuditoriumControllerConstructorParams = {
  auditoriumUseCase: IAuditoriumUseCase;
};

export class AuditoriumController {
  private auditoriumUseCase: IAuditoriumUseCase;

  constructor({ auditoriumUseCase }: AuditoriumControllerConstructorParams) {
    this.auditoriumUseCase = auditoriumUseCase;
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedData = await createAuditoriumSchema.validate(
        {
          ...req.body,
          images: req.files,
        },
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

      await this.auditoriumUseCase.createAuditorium({
        ...validatedData,
        user,
      } as CreateAuditoriumDTO);

      res.status(201).json({
        success: true,
        message: 'Auditorium created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAuditoriums(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as UserTokenDto;

      const result = await this.auditoriumUseCase.getOwnerAuditoriums(user);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
