// validate({ body: schema, query: schema, params: schema })
module.exports = (schemas) => (req, res, next) => {
  try {
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) req[key] = schemas[key].parse(req[key]);
    }
    next();
  } catch (e) { next(e); }
};
