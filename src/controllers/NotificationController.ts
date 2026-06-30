import { Request, Response, NextFunction } from "express";
import { INotificationUseCase } from "../useCases/notification/INotificationUseCase";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";
import * as yup from "yup";

type NotificationControllerConstructorParams = {
  notificationUseCase: INotificationUseCase;
};

const querySchema = yup.object().shape({
  page: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer()
    .min(1),
  limit: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer()
    .min(1),
});

const paramIdSchema = yup.object().shape({
  id: yup
    .string()
    .required()
    .matches(/^[a-f\d]{24}$/i, "Invalid Notification ID"),
});

export class NotificationController {
  private notificationUseCase: INotificationUseCase;

  constructor({ notificationUseCase }: NotificationControllerConstructorParams) {
    this.notificationUseCase = notificationUseCase;
  }

  async getMyNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const query = await querySchema.validate(req.query, { abortEarly: false });
      const result = await this.notificationUseCase.listMyNotifications(
        user,
        query.page ?? null,
        query.limit ?? null,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      const params = await paramIdSchema.validate(req.params, { abortEarly: false });
      const result = await this.notificationUseCase.markAsRead(params.id, user);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    try {
      const user = req.user as UserTokenDto;
      await this.notificationUseCase.markAllAsRead(user);
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}
