const Engineer = require('../models/Engineer');
const Review = require('../models/Review');
const { sanitizePublicText } = require('../utils/publicContentSanitizer');
const { success, ApiError } = require('../utils/apiResponse');

async function listPublicEngineerReviews(req, res) {
  const engineer = await Engineer.findOne({
    pseudonymCode: req.validated.params.code,
    verified: true,
    accountStatus: 'active',
  }).select('_id pseudonymCode');
  if (!engineer) throw new ApiError(404, 'Verified engineer not found');

  const reviews = await Review.find({ engineer: engineer._id, adminApproval: true })
    .select('publicCustomerLabel rating review createdAt')
    .sort({ createdAt: -1 })
    .lean();
  return success(
    res,
    reviews.map((review) => ({
      customer: review.publicCustomerLabel || 'Verified customer',
      rating: review.rating,
      review: sanitizePublicText(review.review),
      createdAt: review.createdAt,
    })),
  );
}

async function recalculateEngineerRating(engineerId) {
  const [summary] = await Review.aggregate([
    { $match: { engineer: engineerId, adminApproval: true } },
    { $group: { _id: '$engineer', rating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Engineer.findByIdAndUpdate(engineerId, {
    rating: summary ? Math.round(summary.rating * 10) / 10 : 0,
    reviewCount: summary?.count || 0,
  });
}

async function listAdminReviews(req, res) {
  const { page = 1, limit = 20, approved, engineer } = req.validated?.query || req.query;
  const filter = approved === undefined ? {} : { adminApproval: approved };
  if (engineer) filter.engineer = engineer;
  const [items, total] = await Promise.all([
    Review.find(filter)
      .select('+customerName +adminNotes +approvedBy +approvedAt')
      .populate('engineer', 'pseudonymCode +fullName')
      .populate('project', 'projectCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function createAdminReview(req, res) {
  const data = req.validated.body;
  const project = await require('../models/Project').findOne({
    _id: data.project,
    engineer: data.engineer,
    status: 'completed',
  });
  if (!project) throw new ApiError(422, 'Reviews require a completed project assigned to this engineer');
  const review = await Review.create({
    ...data,
    approvedBy: data.adminApproval ? req.admin._id : undefined,
    approvedAt: data.adminApproval ? new Date() : undefined,
  });
  await recalculateEngineerRating(review.engineer);
  return success(res, review, { status: 201, message: 'Review created' });
}

async function updateAdminReview(req, res) {
  const data = { ...req.validated.body };
  if (data.adminApproval !== undefined) {
    data.approvedBy = data.adminApproval ? req.admin._id : null;
    data.approvedAt = data.adminApproval ? new Date() : null;
  }
  const review = await Review.findByIdAndUpdate(req.validated.params.id, data, {
    new: true,
    runValidators: true,
  }).select('+customerName +adminNotes +approvedBy +approvedAt');
  if (!review) throw new ApiError(404, 'Review not found');
  await recalculateEngineerRating(review.engineer);
  return success(res, review, { message: 'Review updated' });
}

async function deleteAdminReview(req, res) {
  const review = await Review.findByIdAndDelete(req.validated.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  await recalculateEngineerRating(review.engineer);
  return success(res, null, { message: 'Review deleted' });
}

module.exports = {
  listPublicEngineerReviews,
  listAdminReviews,
  createAdminReview,
  updateAdminReview,
  deleteAdminReview,
  recalculateEngineerRating,
};
