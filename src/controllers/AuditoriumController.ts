import { Request, Response, NextFunction } from "express";
import { IAuditoriumUseCase } from "../useCases/auditorium/IAuditoriumUseCase";
import { CreateAuditoriumDTO } from "../domain/dtos/auditorium/CreateAuditoriumDTO";
import { UpdateAuditoriumDTO } from "../domain/dtos/auditorium/UpdateAuditoriumDTO";
import {
  createAuditoriumSchema,
  updateAuditoriumSchema,
  auditoriumIdParamSchema,
  publicAuditoriumFilterSchema,
  ownerAuditoriumsQuerySchema,
} from "../infrastructure/validation/auditorium/AuditoriumSchemaValidation";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";

type AuditoriumControllerConstructorParams = {
  auditoriumUseCase: IAuditoriumUseCase;
};

export class AuditoriumController {
  private auditoriumUseCase: IAuditoriumUseCase;

  constructor({ auditoriumUseCase }: AuditoriumControllerConstructorParams) {
    this.auditoriumUseCase = auditoriumUseCase;
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
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

      return res.status(201).json({
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
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const filters = await ownerAuditoriumsQuerySchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.auditoriumUseCase.getOwnerAuditoriums(user, filters);
      return res.status(200).json({
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
  ): Promise<Response | void> {
    try {
      const filters = await publicAuditoriumFilterSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.auditoriumUseCase.getPublicAuditoriums(filters);
      return res.status(200).json({
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
  ): Promise<Response | void> {
    try {
      const { id } = await auditoriumIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const result = await this.auditoriumUseCase.getPublicAuditoriumById(id);
      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Auditorium not found" });
      }
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = await auditoriumIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
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
        id,
        user,
        validatedData as UpdateAuditoriumDTO,
      );

      return res.status(200).json({
        success: true,
        data: result,
        message: "Auditorium updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookedAuditoriumDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const { id } = await auditoriumIdParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const user = req.user as UserTokenDto;
      const result = await this.auditoriumUseCase.getBookedAuditoriumDetails(id, user);
      if (!result) {
        return res
          .status(404)
          .json({ success: false, message: "Auditorium not found" });
      }
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
