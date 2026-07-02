import { Request, Response, NextFunction } from "express";
import { ILocationUseCase } from "../useCases/location/ILocationUseCase";
import {
  getDistrictsQuerySchema,
  getCitiesQuerySchema,
} from "../infrastructure/validation/location/LocationValidationSchemas";

type LocationControllerConstructorParams = {
  locationUseCase: ILocationUseCase;
};

export class LocationController {
  private locationUseCase: ILocationUseCase;

  constructor({ locationUseCase }: LocationControllerConstructorParams) {
    this.locationUseCase = locationUseCase;
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result = await this.locationUseCase.getAll();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStates(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const result = await this.locationUseCase.getStates();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDistricts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedQuery = await getDistrictsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      const result = await this.locationUseCase.getDistricts(validatedQuery.state);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCities(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const validatedQuery = await getCitiesQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      const result = await this.locationUseCase.getCities(
        validatedQuery.state,
        validatedQuery.district,
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
