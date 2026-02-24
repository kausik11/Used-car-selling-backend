require('dotenv').config();
const mongoose = require('mongoose');
const {
  CarListing,
  DimensionsCapacity,
  EngineTransmission,
  FuelPerformance,
  SuspensionSteeringBrakes,
  BookingPolicy,
  CarFeatures,
  Tyres,
  Media,
} = require('../models');

const COMPONENT_MODELS = [
  ['DimensionsCapacity', DimensionsCapacity],
  ['EngineTransmission', EngineTransmission],
  ['FuelPerformance', FuelPerformance],
  ['SuspensionSteeringBrakes', SuspensionSteeringBrakes],
  ['BookingPolicy', BookingPolicy],
  ['CarFeatures', CarFeatures],
  ['Tyres', Tyres],
  ['Media', Media],
];

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const listingCarIds = await CarListing.distinct('car_id');

  for (const [name, Model] of COMPONENT_MODELS) {
    const result = await Model.deleteMany({ car_id: { $nin: listingCarIds } });
    // eslint-disable-next-line no-console
    console.log(`${name}: deleted ${result.deletedCount} orphan document(s)`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error('Cleanup failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // ignore disconnect error
  }
  process.exit(1);
});
