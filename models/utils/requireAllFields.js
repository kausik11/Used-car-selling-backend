const applyRequireAllFields = (schema, options = {}) => {
  const excludedPaths = new Set(options.excludePaths || []);

  schema.eachPath((path, schemaType) => {
    if (['_id', '__v', 'created_at', 'updated_at'].includes(path)) return;
    if (excludedPaths.has(path)) return;
    if (!schemaType || typeof schemaType.required !== 'function') return;
    schemaType.required(true);
  });
};

module.exports = applyRequireAllFields;
