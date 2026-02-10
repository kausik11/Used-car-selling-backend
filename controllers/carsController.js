const { v4: uuidv4 } = require('uuid');
const {
  CarListing,
  InspectionModule,
  Tyres,
  Media,
  DimensionsCapacity,
  EngineTransmission,
  FuelPerformance,
  SuspensionSteeringBrakes,
  BookingPolicy,
  CarFeatures,
} = require('../models');

const cleanUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const upsertByCarId = async (Model, car_id, payload) => {
  if (!payload || typeof payload !== 'object') return null;
  return Model.findOneAndUpdate(
    { car_id },
    { $set: payload, $setOnInsert: { car_id } },
    { new: true, upsert: true }
  );
};

const upsertInspectionModules = async (car_id, modules) => {
  if (!Array.isArray(modules)) return;
  const ops = modules
    .filter((m) => m && m.module)
    .map((m) => ({
      updateOne: {
        filter: { car_id, module: m.module },
        update: { $set: { car_id, module: m.module, components: m.components || [] } },
        upsert: true,
      },
    }));
  if (ops.length > 0) {
    await InspectionModule.bulkWrite(ops, { ordered: false });
  }
};

const fetchCarAggregate = async (car_id) => {
  const listing = await CarListing.findOne({ car_id }).lean();
  if (!listing) return null;

  const [
    inspection_modules,
    tyres,
    media,
    dimensions_capacity,
    engine_transmission,
    fuel_performance,
    suspension_steering_brakes,
    booking_policy,
    features,
  ] = await Promise.all([
    InspectionModule.find({ car_id }).lean(),
    Tyres.findOne({ car_id }).lean(),
    Media.findOne({ car_id }).lean(),
    DimensionsCapacity.findOne({ car_id }).lean(),
    EngineTransmission.findOne({ car_id }).lean(),
    FuelPerformance.findOne({ car_id }).lean(),
    SuspensionSteeringBrakes.findOne({ car_id }).lean(),
    BookingPolicy.findOne({ car_id }).lean(),
    CarFeatures.findOne({ car_id }).lean(),
  ]);

  return {
    ...listing,
    inspection_modules: inspection_modules || [],
    tyres: tyres || null,
    media: media || null,
    dimensions_capacity: dimensions_capacity || null,
    engine_transmission: engine_transmission || null,
    fuel_performance: fuel_performance || null,
    suspension_steering_brakes: suspension_steering_brakes || null,
    booking_policy: booking_policy || null,
    features: features || null,
  };
};

const parseFeatures = (featuresParam) => {
  if (!featuresParam) return [];
  if (Array.isArray(featuresParam)) return featuresParam;
  if (typeof featuresParam === 'string') {
    return featuresParam.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const createCar = async (req, res, next) => {
  try {
    const {
      car_id: inputCarId,
      dimensions_capacity,
      engine_transmission,
      fuel_performance,
      suspension_steering_brakes,
      booking_policy,
      features,
      inspection_modules,
      tyres,
      media,
      ...listingData
    } = req.body || {};

    const car_id = inputCarId || uuidv4();

    const [
      dimensionsDoc,
      engineDoc,
      fuelDoc,
      suspensionDoc,
      bookingDoc,
      featuresDoc,
      tyresDoc,
      mediaDoc,
    ] = await Promise.all([
      upsertByCarId(DimensionsCapacity, car_id, dimensions_capacity),
      upsertByCarId(EngineTransmission, car_id, engine_transmission),
      upsertByCarId(FuelPerformance, car_id, fuel_performance),
      upsertByCarId(SuspensionSteeringBrakes, car_id, suspension_steering_brakes),
      upsertByCarId(BookingPolicy, car_id, booking_policy),
      upsertByCarId(CarFeatures, car_id, features),
      upsertByCarId(Tyres, car_id, tyres),
      upsertByCarId(Media, car_id, media),
    ]);

    await upsertInspectionModules(car_id, inspection_modules);

    const listingPayload = {
      car_id,
      ...listingData,
      dimensions_capacity_id: dimensionsDoc ? dimensionsDoc._id : undefined,
      engine_transmission_id: engineDoc ? engineDoc._id : undefined,
      fuel_performance_id: fuelDoc ? fuelDoc._id : undefined,
      suspension_steering_brakes_id: suspensionDoc ? suspensionDoc._id : undefined,
      booking_policy_id: bookingDoc ? bookingDoc._id : undefined,
    };

    const listing = await CarListing.create(cleanUndefined(listingPayload));

    return res.status(201).json({
      car_id: listing.car_id,
      status: listing.status,
      visibility: listing.visibility,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    });
  } catch (err) {
    return next(err);
  }
};

const updateCar = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    const {
      dimensions_capacity,
      engine_transmission,
      fuel_performance,
      suspension_steering_brakes,
      booking_policy,
      features,
      inspection_modules,
      tyres,
      media,
      ...listingData
    } = req.body || {};

    await Promise.all([
      upsertByCarId(DimensionsCapacity, car_id, dimensions_capacity),
      upsertByCarId(EngineTransmission, car_id, engine_transmission),
      upsertByCarId(FuelPerformance, car_id, fuel_performance),
      upsertByCarId(SuspensionSteeringBrakes, car_id, suspension_steering_brakes),
      upsertByCarId(BookingPolicy, car_id, booking_policy),
      upsertByCarId(CarFeatures, car_id, features),
      upsertByCarId(Tyres, car_id, tyres),
      upsertByCarId(Media, car_id, media),
    ]);

    await upsertInspectionModules(car_id, inspection_modules);

    const updated = await CarListing.findOneAndUpdate(
      { car_id },
      { $set: cleanUndefined(listingData) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Car not found' });

    return res.json({
      car_id: updated.car_id,
      status: updated.status,
      visibility: updated.visibility,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteCar = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    const updated = await CarListing.findOneAndUpdate(
      { car_id },
      { $set: { status: 'archived', visibility: 'hidden' } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Car not found' });

    return res.json({
      car_id: updated.car_id,
      status: updated.status,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    return next(err);
  }
};

const getCar = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    const result = await fetchCarAggregate(car_id);
    if (!result) return res.status(404).json({ error: 'Car not found' });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

const listCars = async (req, res, next) => {
  try {
    const {
      brand,
      model,
      variant,
      make_year,
      registration_year,
      city,
      kms_min,
      kms_max,
      price_min,
      price_max,
      fuel_type,
      transmission,
      body_type,
      status,
      visibility,
      page = 1,
      limit = 20,
      sort = '-created_at',
    } = req.query;

    const brandList = typeof brand === 'string' ? brand.split(',').map((b) => b.trim()).filter(Boolean) : [];

    const filters = cleanUndefined({
      brand: brandList.length > 0 ? { $in: brandList } : brand,
      model,
      variant,
      make_year: make_year ? { $gte: Number(make_year) } : undefined,
      registration_year: registration_year ? Number(registration_year) : undefined,
      city,
      fuel_type,
      transmission,
      body_type,
      status,
      visibility,
    });

    if (kms_min || kms_max) {
      filters.kms_driven = {};
      if (kms_min) filters.kms_driven.$gte = Number(kms_min);
      if (kms_max) filters.kms_driven.$lte = Number(kms_max);
    }

    if (price_min || price_max) {
      filters['price.amount'] = {};
      if (price_min) filters['price.amount'].$gte = Number(price_min);
      if (price_max) filters['price.amount'].$lte = Number(price_max);
    }

    const featuresList = parseFeatures(req.query.features);
    if (featuresList.length > 0) {
      const featureQuery = featuresList.reduce((acc, path) => {
        acc[path] = true;
        return acc;
      }, {});
      const featureDocs = await CarFeatures.find(featureQuery, { car_id: 1 }).lean();
      const carIds = featureDocs.map((d) => d.car_id);
      if (carIds.length === 0) {
        return res.json({ page: Number(page), limit: Number(limit), total: 0, items: [] });
      }
      filters.car_id = { $in: carIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, items] = await Promise.all([
      CarListing.countDocuments(filters),
      CarListing.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
    ]);

    const carIds = items.map((item) => item.car_id);
    const mediaDocs = carIds.length
      ? await Media.find({ car_id: { $in: carIds } }).lean()
      : [];
    const mediaByCarId = mediaDocs.reduce((acc, doc) => {
      acc[doc.car_id] = doc;
      return acc;
    }, {});

    const itemsWithMedia = items.map((item) => ({
      ...item,
      media: mediaByCarId[item.car_id] || null,
    }));

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      items: itemsWithMedia,
    });
  } catch (err) {
    return next(err);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    const { car_id } = req.params;
    const bodyImages = req.body?.images;
    const bodyReport = req.body?.inspection_report;

    const files = Array.isArray(req.files) ? req.files : [];
    const imageFiles = files.filter((f) => f.fieldname === 'images');
    const reportFiles = files.filter((f) => f.fieldname === 'inspection_report');

    const uploadedImages = imageFiles.map((file, index) => ({
      url: file.path,
      kind: req.body?.[`images_kind_${index}`] || 'other',
      sort_order: index + 1,
    }));

    const uploadedReport = reportFiles[0] ? { url: reportFiles[0].path, type: 'pdf' } : null;

    const media = await Media.findOneAndUpdate(
      { car_id },
      {
        $set: {
          car_id,
          ...(uploadedImages.length > 0 ? { images: uploadedImages } : {}),
          ...(uploadedReport ? { inspection_report: uploadedReport } : {}),
          ...(bodyImages ? { images: bodyImages } : {}),
          ...(bodyReport ? { inspection_report: bodyReport } : {}),
        },
      },
      { new: true, upsert: true }
    );

    return res.json({
      car_id: media.car_id,
      images: media.images || [],
      inspection_report: media.inspection_report || null,
      updated_at: media.updated_at,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createCar,
  updateCar,
  deleteCar,
  getCar,
  listCars,
  uploadMedia,
};
