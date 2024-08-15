const Joi = require("joi");

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().min(4).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { SongPayloadSchema };
