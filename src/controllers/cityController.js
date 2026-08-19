const City = require('../models/City');
const { success, ApiError } = require('../utils/apiResponse');

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function listPublicCities(_req, res) {
  const cities = await City.find({ isActive: true })
    .select('name code slug state')
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return success(res, cities.map(({ _id, ...city }) => city));
}

async function listAdminCities(_req, res) {
  return success(res, await City.find().sort({ sortOrder: 1, name: 1 }));
}

async function createCity(req, res) {
  const data = req.validated.body;
  const city = await City.create({ ...data, slug: data.slug || toSlug(data.name) });
  return success(res, city, { status: 201, message: 'City created' });
}

async function updateCity(req, res) {
  const data = { ...req.validated.body };
  if (data.name && !data.slug) data.slug = toSlug(data.name);
  const city = await City.findByIdAndUpdate(req.validated.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!city) throw new ApiError(404, 'City not found');
  return success(res, city, { message: 'City updated' });
}

async function deleteCity(req, res) {
  const city = await City.findByIdAndUpdate(
    req.validated.params.id,
    { isActive: false },
    { new: true, runValidators: true },
  );
  if (!city) throw new ApiError(404, 'City not found');
  return success(res, city, { message: 'City deactivated' });
}

module.exports = { listPublicCities, listAdminCities, createCity, updateCity, deleteCity };
