import { Router, Request, Response, NextFunction } from 'express';
import { AwilixContainer } from 'awilix';
import { IContainer } from '../../ioc/registry';
import { requireRole } from '../../middleware/Auth/AuthMiddleware';

export const setupAuditoriumRoutes = (container: AwilixContainer<IContainer>): Router => {
  const router = Router();
  const auditoriumController = container.resolve('auditoriumController');

  router.post(
    '/',
    requireRole(['owner']),
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.create(req, res, next)
  );

  router.get('/my', requireRole(['owner']), async (req: Request, res: Response, next: NextFunction) =>
    auditoriumController.getMyAuditoriums(req, res, next)
  );

  return router;
};
