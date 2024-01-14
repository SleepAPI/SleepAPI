import express from 'express';

class BaseRouterImpl {
  public router = express.Router();
}

export const BaseRouter = new BaseRouterImpl();
