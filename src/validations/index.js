import vine from '@vinejs/vine';
import schemas from './validationSchemas.js';

const validateBody = async (data, schema) => {
  await vine.validate({ schema: schemas[schema], data });
}

export default validateBody;