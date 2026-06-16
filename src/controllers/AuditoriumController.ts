import { Request, Response, NextFunction } from "express";
import { IAuditoriumUseCase } from "../useCases/auditorium/IAuditoriumUseCase";
import { CreateAuditoriumDTO } from "../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../domain/dtos/auditorium/UpdateAuditoriumDTO";
import {
  createAuditoriumSchema,
  updateAuditoriumSchema,
} from "../infrastructure/validation/auditorium/AuditoriumValidationSchemas";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";

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
        },
      );

      await this.auditoriumUseCase.createAuditorium({
        ...validatedData,
        user,
      } as CreateAuditoriumDTO);

      res.status(201).json({
        success: true,
        message: "Auditorium created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAuditoriums(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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

  async getPublicAuditoriums(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await this.auditoriumUseCase.getPublicAuditoriums();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditoriumById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.auditoriumUseCase.getAuditoriumById(
        id as string,
      );
      if (!result) {
        res
          .status(404)
          .json({ success: false, message: "Auditorium not found" });
        return;
      }
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user as UserTokenDto;

      const validatedData = await updateAuditoriumSchema.validate(
        {
          ...req.body,
          newImages: req.files || [],
        },
        {
          abortEarly: false,
          stripUnknown: true,
        },
      );

      const result = await this.auditoriumUseCase.updateAuditorium(
        id as string,
        user,
        validatedData as UpdateAuditoriumDTO,
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Auditorium updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
