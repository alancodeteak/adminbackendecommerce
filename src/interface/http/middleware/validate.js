import { ValidationError } from "../../../domain/errors/ValidationError.js";

export function validate({ body, query, params } = {}) {
  return (req, _res, next) => {
    try {
      req.perf?.start("validation_ms");
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      req.perf?.end("validation_ms");
      next();
    } catch (err) {
      req.perf?.end("validation_ms");
      next(new ValidationError("Invalid request", err));
    }
  };
}

