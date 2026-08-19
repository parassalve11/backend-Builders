const { sanitizePublicText } = require('./publicContentSanitizer');

const toPlain = (value) =>
  value && typeof value.toObject === 'function' ? value.toObject() : value || {};

function serializeRate(rate) {
  if (!rate) return null;
  if (typeof rate === 'number') return { min: rate, max: rate, currency: 'INR', unit: 'sq.ft' };
  return {
    min: Number(rate.min) || 0,
    max: Number(rate.max) || Number(rate.min) || 0,
    currency: rate.currency || 'INR',
    unit: rate.unit || 'sq.ft',
  };
}

function toPublicPortfolio(item) {
  const portfolio = toPlain(item);
  return {
    projectCode: portfolio.projectCode,
    projectName: sanitizePublicText(portfolio.projectName),
    projectType: portfolio.projectType,
    location: sanitizePublicText(portfolio.publicLocation || portfolio.location),
    description: sanitizePublicText(portfolio.description),
    builtUpArea: portfolio.builtUpArea,
    floors: portfolio.floors,
    status: portfolio.status,
    completionDate: portfolio.completionDate,
    photos: Array.isArray(portfolio.photos) ? portfolio.photos : [],
    plans2D: Array.isArray(portfolio.plans2D) ? portfolio.plans2D : [],
    elevations3D: Array.isArray(portfolio.elevations3D) ? portfolio.elevations3D : [],
  };
}

function toPublicEngineer(value, portfolioItems) {
  const engineer = toPlain(value);
  const portfolios = portfolioItems || engineer.portfolio || engineer.portfolios || [];
  return {
    code: engineer.pseudonymCode,
    pseudonymCode: engineer.pseudonymCode,
    city: engineer.city,
    cityCode: engineer.cityCode,
    serviceAreas: Array.isArray(engineer.serviceAreas) ? engineer.serviceAreas : [],
    engineerType: engineer.engineerType,
    yearsExperience: engineer.yearsExperience || 0,
    completedProjectsCount: engineer.completedProjectsCount || 0,
    averageProjectDurationMonths: engineer.averageProjectDurationMonths || null,
    ratePerSqFt: serializeRate(engineer.ratePerSqFt),
    rating: engineer.rating || 0,
    reviewCount: engineer.reviewCount || 0,
    specializations: Array.isArray(engineer.specializations) ? engineer.specializations : [],
    skills: Array.isArray(engineer.skills) ? engineer.skills : [],
    qualification: engineer.qualification,
    engineeringBranch: engineer.engineeringBranch,
    professionalExperience: sanitizePublicText(engineer.professionalExperience),
    certificationBadges: Array.isArray(engineer.certificationBadges)
      ? engineer.certificationBadges.map(sanitizePublicText)
      : [],
    availabilityStatus: engineer.availabilityStatus || 'available',
    verified: engineer.verified === true,
    portfolio: portfolios
      .filter((item) => toPlain(item).isPublicApproved === true)
      .map(toPublicPortfolio),
  };
}

module.exports = { toPublicEngineer, toPublicPortfolio };
