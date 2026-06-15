import { Request, Response, NextFunction } from 'express';
import { IAuditoriumUseCase } from '../useCases/auditorium/IAuditoriumUseCase';
import { CreateAuditoriumDTO } from '../domain/dtos/auditorium/CreateAuditoriumDTO';
import { createAuditoriumSchema } from '../infrastructure/validation/auditorium/AuditoriumValidationSchemas';

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
      const validatedData = await createAuditoriumSchema.validate(req.body, {
        abortEarly: false,
      });

      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ success: false, message: 'Unauthorized. Owner context missing' });
        return;
      }

      const result = await this.auditoriumUseCase.createAuditorium({
        ...validatedData,
        ownerId,
      } as CreateAuditoriumDTO);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Auditorium created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAuditoriums(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        res.status(401).json({ success: false, message: 'Unauthorized. Owner context missing' });
        return;
      }

      const result = await this.auditoriumUseCase.getOwnerAuditoriums(ownerId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
