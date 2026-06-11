import { Router, Request, Response, NextFunction } from 'express';
import { AwilixContainer } from 'awilix';
import { IContainer } from '../ioc/registry';

// User Routes - defines all user endpoints
export const setupUserRoutes = (container: AwilixContainer<IContainer>): Router => {
  const router = Router();
  const userController = container.resolve('userController');

  // POST /user - Create a new user
  router.post('/', async (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
  );

  // GET /user - Get all users
  router.get('/', async (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next)
  );

  // GET /user/:id - Get user by ID
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) =>
    userController.getById(req, res, next)
  );

  // PATCH /user/:id - Update user
  router.patch('/:id', async (req: Request, res: Response, next: NextFunction) =>
    userController.update(req, res, next)
  );

  // DELETE /user/:id - Delete user
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) =>
    userController.delete(req, res, next)
  );

  return router;
};
