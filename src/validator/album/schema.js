const Joi = require("joi");

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(4).required(),
});

module.exports = { AlbumPayloadSchema };
