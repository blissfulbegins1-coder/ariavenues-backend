import { Router, Request, Response, NextFunction } from 'express';
import { AwilixContainer } from 'awilix';
import { IContainer } from '../../ioc/registry';

// User Routes - defines all user endpoints
export const setupUserRoutes = (container: AwilixContainer<IContainer>): Router => {
  const router = Router();
  const userController = container.resolve('userController');

  // POST /user - Create a new user
  router.post('/', async (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
  );

  return router;
};
