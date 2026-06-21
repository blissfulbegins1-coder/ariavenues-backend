import { Request, Response, NextFunction } from "express";
import { ILocationUseCase } from "../useCases/location/ILocationUseCase";

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
      const { state } = req.query;
      if (!state || typeof state !== "string") {
        return res.status(400).json({
          success: false,
          message: "State query parameter is required",
        });
      }
      const result = await this.locationUseCase.getDistricts(state);
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
      const { state, district } = req.query;
      if (!state || typeof state !== "string") {
        return res.status(400).json({
          success: false,
          message: "State query parameter is required",
        });
      }
      if (!district || typeof district !== "string") {
        return res.status(400).json({
          success: false,
          message: "District query parameter is required",
        });
      }
      const result = await this.locationUseCase.getCities(state, district);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
