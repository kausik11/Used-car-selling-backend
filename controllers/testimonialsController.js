const Testimonial = require('../models/Testimonial');
const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (file) => {
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  const uploadResult = await cloudinary.uploader.upload(base64Image, {
    folder: 'singhbackend/testimonials',
    resource_type: 'auto',
  });

  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  };
};

const getTestimonials = async (_req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json(testimonials);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to fetch testimonials';
    return next(error);
  }
};

const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    return res.status(200).json(testimonial);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to fetch testimonial';
    return next(error);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const { fullName, rating, message } = req.body || {};

    if (!fullName || !rating || !message) {
      return res.status(400).json({ message: 'Full name, rating, and message are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'User image is required' });
    }

    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const { imageUrl, imagePublicId } = await uploadImage(req.file);

    const testimonial = await Testimonial.create({
      fullName: String(fullName).trim(),
      rating: parsedRating,
      message: String(message).trim(),
      imageUrl,
      imagePublicId,
    });

    return res.status(201).json(testimonial);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to create testimonial';
    return next(error);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { fullName, rating, message } = req.body || {};
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (fullName) testimonial.fullName = String(fullName).trim();
    if (message) testimonial.message = String(message).trim();

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      testimonial.rating = parsedRating;
    }

    if (req.file) {
      const { imageUrl, imagePublicId } = await uploadImage(req.file);

      if (testimonial.imagePublicId) {
        await cloudinary.uploader.destroy(testimonial.imagePublicId);
      }

      testimonial.imageUrl = imageUrl;
      testimonial.imagePublicId = imagePublicId;
    }

    await testimonial.save();

    return res.status(200).json(testimonial);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to update testimonial';
    return next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (testimonial.imagePublicId) {
      await cloudinary.uploader.destroy(testimonial.imagePublicId);
    }

    await testimonial.deleteOne();

    return res.status(200).json({ message: 'Testimonial deleted' });
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to delete testimonial';
    return next(error);
  }
};

module.exports = {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
