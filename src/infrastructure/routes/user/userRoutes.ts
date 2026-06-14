import { Router, Request, Response, NextFunction } from 'express';
import { AwilixContainer } from 'awilix';
import { IContainer } from '../../ioc/registry';

// User Routes - defines all user endpoints
export const setupUserRoutes = (container: AwilixContainer<IContainer>): Router => {
  const router = Router();
  const userController = container.resolve('userController');

  // POST /user/signup - Initiate user signup and send OTP
  router.post('/signup', async (req: Request, res: Response, next: NextFunction) =>
    userController.signUp(req, res, next)
  );

  // POST /user/verify-otp - Verify OTP and complete signup
  router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) =>
    userController.verifyOtp(req, res, next)
  );

  // POST /user/resend-otp - Resend OTP
  router.post('/resend-otp', async (req: Request, res: Response, next: NextFunction) =>
    userController.resendOtp(req, res, next)
  );

  // POST /user/signin - Initiate user sign in and send OTP
  router.post('/signin', async (req: Request, res: Response, next: NextFunction) =>
    userController.signIn(req, res, next)
  );

  return router;
};

