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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toExactCaseInsensitiveRegex = (value) =>
  new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

const lakhToRupees = (value) => Math.round(Number(value) * 100000);

const parseBudgetLakhRange = (text) => {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*lakh/i);
  if (!match) return null;
  const min = lakhToRupees(match[1]);
  const max = lakhToRupees(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min: Math.min(min, max), max: Math.max(min, max) };
};

const parseSearchTextHints = (q) => {
  if (!q || typeof q !== 'string') return {};
  const text = q.trim();
  if (!text) return {};

  const hints = {};

  const budgetMatch = parseBudgetLakhRange(text);
  if (budgetMatch) {
    hints.price_min = budgetMatch.min;
    hints.price_max = budgetMatch.max;
  }

  const yearMatch = text.match(/\bfrom\s+(\d{4})\b/i);
  if (yearMatch) hints.make_year = Number(yearMatch[1]);

  if (/\bmanual\b/i.test(text)) hints.transmission = 'manual';
  if (/\bautomatic\b/i.test(text)) hints.transmission = 'automatic';

  const cityMatch = text.match(/\bin\s+([a-z][a-z\s]+?)(?=\s+in\s+\d|\s*$)/i);
  if (cityMatch) hints.city = cityMatch[1].trim();

  return hints;
};

const findBestTextMatch = (text, values) => {
  if (!text || !Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values]
    .filter((v) => typeof v === 'string' && v.trim())
    .sort((a, b) => b.length - a.length);

  return sorted.find((item) => {
    const pattern = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return pattern.test(text);
  }) || null;
};

const INSPECTION_MODULE_DESCRIPTION_MAP = {
  'Core systems': 'Engine, transmission & chassis',
  'Supporting systems': 'Fuel supply, ignition & other systems',
  'Interiors & AC': 'Seats, AC, audio & other features',
  'Exteriors & lights': 'Panels, glasses, lights & fixtures',
  'Wear & tear parts': 'Tyres, clutch, brakes & more',
};

const slugifyPart = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildCarSlug = (listing) => {
  const year = listing.registration_year || listing.make_year;
  const parts = [listing.variant, listing.fuel_type, listing.area, year].map(slugifyPart).filter(Boolean);
  if (parts.length > 0) return parts.join('-');
  return slugifyPart(listing.title || listing.model || 'used-car');
};

const buildSlugPath = ({ city, brand, model, car_slug, listing_ref }) =>
  `buy-used-cars/${slugifyPart(city)}/${slugifyPart(brand)}/${slugifyPart(model)}/${car_slug}/${listing_ref}`;

const createListingRef = () => String(Math.floor(10000000 + Math.random() * 90000000));

const getUniqueListingRef = async () => {
  for (let i = 0; i < 12; i += 1) {
    const candidate = createListingRef();
    const exists = await CarListing.exists({ listing_ref: candidate });
    if (!exists) return candidate;
  }
  return `${Date.now()}`.slice(-8);
};

const buildSlugFields = async (listing, existingRef) => {
  const listing_ref = existingRef || listing.listing_ref || (await getUniqueListingRef());
  const car_slug = slugifyPart(listing.car_slug) || buildCarSlug(listing);
  return {
    listing_ref,
    car_slug,
    slug_path: buildSlugPath({ ...listing, car_slug, listing_ref }),
  };
};

const ensureListingSlugFields = async (listing) => {
  if (!listing) return listing;
  if (listing.listing_ref && listing.car_slug && listing.slug_path) return listing;

  const slugFields = await buildSlugFields(listing, listing.listing_ref);
  await CarListing.updateOne({ _id: listing._id }, { $set: slugFields });
  return { ...listing, ...slugFields };
};

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
    .filter((m) => m && m.module && INSPECTION_MODULE_DESCRIPTION_MAP[m.module])
    .map((m) => ({
      updateOne: {
        filter: { car_id, module: m.module },
        update: {
          $set: {
            car_id,
            module: m.module,
            description: INSPECTION_MODULE_DESCRIPTION_MAP[m.module],
            parts_count: m.parts_count,
            assemblies_count: m.assemblies_count,
            score: m.score,
            rating: m.rating,
            summary: m.summary,
            module_image_url: m.module_image_url,
            components: m.components || [],
          },
        },
        upsert: true,
      },
    }));
  if (ops.length > 0) {
    await InspectionModule.bulkWrite(ops, { ordered: false });
  }
};

const fetchCarAggregate = async (car_id) => {
  const rawListing = await CarListing.findOne({ car_id }).lean();
  if (!rawListing) return null;
  const listing = await ensureListingSlugFields(rawListing);

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
    const slugFields = await buildSlugFields(listingPayload);
    const listing = await CarListing.create(cleanUndefined({ ...listingPayload, ...slugFields }));

    return res.status(201).json({
      car_id: listing.car_id,
      status: listing.status,
      visibility: listing.visibility,
      listing_ref: listing.listing_ref,
      car_slug: listing.car_slug,
      slug_path: listing.slug_path,
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

    const existingListing = await CarListing.findOne({ car_id }).lean();
    if (!existingListing) return res.status(404).json({ error: 'Car not found' });

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

    const listingUpdates = cleanUndefined(listingData);
    const slugFields = await buildSlugFields(
      { ...existingListing, ...listingUpdates },
      existingListing.listing_ref
    );

    const updated = await CarListing.findOneAndUpdate(
      { car_id },
      { $set: { ...listingUpdates, ...slugFields } },
      { new: true }
    );

    return res.json({
      car_id: updated.car_id,
      status: updated.status,
      visibility: updated.visibility,
      listing_ref: updated.listing_ref,
      car_slug: updated.car_slug,
      slug_path: updated.slug_path,
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

const getCarBySlug = async (req, res, next) => {
  try {
    const { city, brand, model, car_slug, listing_ref } = req.params;
    const incomingPath = buildSlugPath({ city, brand, model, car_slug, listing_ref });

    let listing = await CarListing.findOne({ slug_path: incomingPath }).lean();
    if (!listing) {
      listing = await CarListing.findOne({ listing_ref }).lean();
    }
    if (!listing) return res.status(404).json({ error: 'Car not found' });

    const result = await fetchCarAggregate(listing.car_id);
    if (!result) return res.status(404).json({ error: 'Car not found' });

    return res.json({
      ...result,
      slug_match: result.slug_path === incomingPath,
      canonical_slug_path: result.slug_path,
    });
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
      q,
      price_lakh_min,
      price_lakh_max,
      budget_lakh,
      year_from,
      page = 1,
      limit = 20,
      sort = '-created_at',
    } = req.query;

    const searchHints = parseSearchTextHints(q);

    let resolvedBrand = brand;
    let resolvedModel = model;
    if ((!resolvedBrand || !resolvedModel) && typeof q === 'string' && q.trim()) {
      const brands = await CarListing.distinct('brand');
      const matchedBrand = findBestTextMatch(q, brands);
      if (!resolvedBrand && matchedBrand) resolvedBrand = matchedBrand;

      if (!resolvedModel && matchedBrand) {
        const modelsForBrand = await CarListing.distinct('model', {
          brand: toExactCaseInsensitiveRegex(matchedBrand),
        });
        const matchedModel = findBestTextMatch(q, modelsForBrand);
        if (matchedModel) resolvedModel = matchedModel;
      }
    }

    const brandList =
      typeof resolvedBrand === 'string'
        ? resolvedBrand.split(',').map((b) => b.trim()).filter(Boolean)
        : [];

    const makeYearFilter =
      make_year !== undefined
        ? { $gte: Number(make_year) }
        : year_from !== undefined
          ? { $gte: Number(year_from) }
          : searchHints.make_year !== undefined
            ? { $gte: Number(searchHints.make_year) }
            : undefined;

    const cityFilter = city || searchHints.city;
    const transmissionFilter = transmission || searchHints.transmission;

    const filters = cleanUndefined({
      brand:
        brandList.length > 0
          ? { $in: brandList.map((item) => toExactCaseInsensitiveRegex(item)) }
          : undefined,
      model: resolvedModel ? toExactCaseInsensitiveRegex(resolvedModel) : undefined,
      variant,
      make_year: makeYearFilter,
      registration_year: registration_year ? Number(registration_year) : undefined,
      city: cityFilter ? toExactCaseInsensitiveRegex(cityFilter) : undefined,
      fuel_type,
      transmission: transmissionFilter || undefined,
      body_type,
      status,
      visibility,
    });

    if (kms_min || kms_max) {
      filters.kms_driven = {};
      if (kms_min) filters.kms_driven.$gte = Number(kms_min);
      if (kms_max) filters.kms_driven.$lte = Number(kms_max);
    }

    const budgetRange = parseBudgetLakhRange(budget_lakh);
    const parsedPriceMin =
      price_min !== undefined
        ? Number(price_min)
        : price_lakh_min !== undefined
          ? lakhToRupees(price_lakh_min)
          : budgetRange?.min ?? searchHints.price_min;
    const parsedPriceMax =
      price_max !== undefined
        ? Number(price_max)
        : price_lakh_max !== undefined
          ? lakhToRupees(price_lakh_max)
          : budgetRange?.max ?? searchHints.price_max;

    if (parsedPriceMin !== undefined || parsedPriceMax !== undefined) {
      filters['price.amount'] = {};
      if (parsedPriceMin !== undefined) filters['price.amount'].$gte = parsedPriceMin;
      if (parsedPriceMax !== undefined) filters['price.amount'].$lte = parsedPriceMax;
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
    const [total, rawItems] = await Promise.all([
      CarListing.countDocuments(filters),
      CarListing.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
    ]);

    const items = await Promise.all(rawItems.map((item) => ensureListingSlugFields(item)));

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
      view_type: req.body?.[`images_view_type_${index}`] || 'gallery',
      gallery_category:
        req.body?.[`images_gallery_category_${index}`] ||
        req.body?.[`images_kind_${index}`] ||
        'other',
      // Keep writing legacy key so existing clients keep working.
      kind: req.body?.[`images_kind_${index}`] || req.body?.[`images_gallery_category_${index}`] || 'other',
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
  getCarBySlug,
  listCars,
  uploadMedia,
};
