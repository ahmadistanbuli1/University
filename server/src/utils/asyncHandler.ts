import type { RequestHandler } from 'express';

type AsyncRequestHandler = (...args: Parameters<RequestHandler>) => Promise<unknown>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
