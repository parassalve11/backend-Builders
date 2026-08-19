const ENGINEER_PRIVATE_SELECT = [
  '+fullName',
  '+phone',
  '+alternatePhone',
  '+email',
  '+exactAddress',
  '+profilePhoto',
  '+emergencyContact',
  '+internalContactInformation',
  '+employeePartnerId',
  '+internalNotes',
  '+college',
  '+graduationYear',
  '+certifications',
  '+professionalRegistration',
  '+licenseDetails',
  '+verificationStatus',
].join(' ');

const LEAD_PRIVATE_SELECT = [
  '+customerName',
  '+phone',
  '+email',
  '+projectDetails',
  '+budgetRange',
  '+adminNotes',
].join(' ');

const PROJECT_PRIVATE_SELECT = [
  '+customerName',
  '+customerPhone',
  '+customerEmail',
  '+constructionLocation',
  '+estimatedCost',
  '+finalCost',
  '+adminManager',
  '+delayDays',
  '+delayReason',
  '+internalNotes',
].join(' ');

const STAGE_PRIVATE_SELECT = '+photos +engineerRemarks +adminRemarks';
const DOCUMENT_PRIVATE_SELECT = '+fileUrl +adminNotes';

module.exports = {
  ENGINEER_PRIVATE_SELECT,
  LEAD_PRIVATE_SELECT,
  PROJECT_PRIVATE_SELECT,
  STAGE_PRIVATE_SELECT,
  DOCUMENT_PRIVATE_SELECT,
};
