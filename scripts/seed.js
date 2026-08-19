const { connectDatabase, disconnectDatabase } = require('../src/config/db');
const AdminUser = require('../src/models/AdminUser');
const City = require('../src/models/City');
const Engineer = require('../src/models/Engineer');
const EngineerPortfolio = require('../src/models/EngineerPortfolio');
const EngineerVerification = require('../src/models/EngineerVerification');
const EngineerPerformance = require('../src/models/EngineerPerformance');
const Project = require('../src/models/Project');
const ProjectStage = require('../src/models/ProjectStage');
const Review = require('../src/models/Review');

const adminEmail = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD || '';

function assertSeedCredentials() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error('SEED_ADMIN_EMAIL must be set to a valid email address');
  }
  if (
    adminPassword.length < 12 ||
    !/[a-z]/.test(adminPassword) ||
    !/[A-Z]/.test(adminPassword) ||
    !/\d/.test(adminPassword) ||
    !/[^A-Za-z0-9]/.test(adminPassword)
  ) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be at least 12 characters and include upper, lower, number, and symbol',
    );
  }
}

const demoEngineers = [
  {
    pseudonymCode: 'ENG-YVT-01',
    fullName: 'Demo Engineer One',
    phone: '9876543210',
    email: 'engineer.one@example.invalid',
    exactAddress: 'Private demo address, Yavatmal',
    city: 'Yavatmal',
    cityCode: 'YVT',
    serviceAreas: ['Yavatmal', 'Dhamangaon Road'],
    engineerType: 'civil_engineer',
    accountStatus: 'active',
    availabilityStatus: 'available',
    yearsExperience: 7,
    completedProjectsCount: 14,
    averageProjectDurationMonths: 8,
    ratePerSqFt: { min: 1450, max: 1800, currency: 'INR', unit: 'sq.ft' },
    rating: 4.8,
    reviewCount: 1,
    specializations: ['Residential', 'RCC'],
    skills: ['Site supervision', 'Cost estimation', 'RCC design coordination'],
    qualification: 'B.E. Civil Engineering',
    engineeringBranch: 'Civil Engineering',
    professionalExperience: 'Residential construction and RCC project delivery.',
    certificationBadges: ['Company verified', 'Safety trained'],
    verified: true,
    verificationStatus: 'verified',
  },
  {
    pseudonymCode: 'ENG-YVT-02',
    fullName: 'Demo Engineer Two',
    phone: '9876543211',
    email: 'engineer.two@example.invalid',
    exactAddress: 'Private demo address, Yavatmal',
    city: 'Yavatmal',
    cityCode: 'YVT',
    serviceAreas: ['Yavatmal', 'Arni'],
    engineerType: 'structural_engineer',
    accountStatus: 'active',
    availabilityStatus: 'limited',
    yearsExperience: 11,
    completedProjectsCount: 29,
    averageProjectDurationMonths: 10,
    ratePerSqFt: { min: 1650, max: 2100, currency: 'INR', unit: 'sq.ft' },
    rating: 4.7,
    reviewCount: 0,
    specializations: ['Structural', 'Commercial', 'RCC'],
    skills: ['Structural review', 'Quality control', 'Site inspection'],
    qualification: 'M.Tech Structural Engineering',
    engineeringBranch: 'Structural Engineering',
    professionalExperience: 'Structural planning and quality review for residential and commercial work.',
    certificationBadges: ['Company verified'],
    verified: true,
    verificationStatus: 'verified',
  },
  {
    pseudonymCode: 'ENG-NGP-01',
    fullName: 'Demo Engineer Three',
    phone: '9876543212',
    email: 'engineer.three@example.invalid',
    exactAddress: 'Private demo address, Nagpur',
    city: 'Nagpur',
    cityCode: 'NGP',
    serviceAreas: ['Nagpur'],
    engineerType: 'architect',
    accountStatus: 'active',
    availabilityStatus: 'available',
    yearsExperience: 9,
    completedProjectsCount: 21,
    averageProjectDurationMonths: 7,
    ratePerSqFt: { min: 1550, max: 1950, currency: 'INR', unit: 'sq.ft' },
    rating: 4.6,
    reviewCount: 0,
    specializations: ['Architecture', '3D Elevation', 'Renovation'],
    skills: ['Space planning', '3D visualization', 'Construction drawings'],
    qualification: 'Bachelor of Architecture',
    engineeringBranch: 'Architecture',
    professionalExperience: 'Residential design, renovation and construction drawing coordination.',
    certificationBadges: ['Company verified'],
    verified: true,
    verificationStatus: 'verified',
  },
];

async function seedAdmin() {
  let admin = await AdminUser.findOne({ email: adminEmail });
  if (!admin) {
    admin = await AdminUser.create({
      fullName: 'ॠKABH Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
      isActive: true,
    });
    console.log(`Created admin: ${adminEmail}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }
  return admin;
}

async function seedCities() {
  const cities = [
    { name: 'Yavatmal', code: 'YVT', slug: 'yavatmal', state: 'Maharashtra', isActive: true, sortOrder: 1 },
    { name: 'Nagpur', code: 'NGP', slug: 'nagpur', state: 'Maharashtra', isActive: true, sortOrder: 2 },
    { name: 'Amravati', code: 'AMR', slug: 'amravati', state: 'Maharashtra', isActive: true, sortOrder: 3 },
  ];
  for (const city of cities) {
    // eslint-disable-next-line no-await-in-loop
    await City.findOneAndUpdate({ slug: city.slug }, city, { upsert: true, runValidators: true });
  }
}

async function seedEngineers(admin) {
  const engineers = [];
  for (const data of demoEngineers) {
    // eslint-disable-next-line no-await-in-loop
    const engineer = await Engineer.findOneAndUpdate({ pseudonymCode: data.pseudonymCode }, data, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    engineers.push(engineer);
    // eslint-disable-next-line no-await-in-loop
    await EngineerVerification.findOneAndUpdate(
      { engineer: engineer._id },
      {
        engineer: engineer._id,
        status: 'verified',
        verificationDate: new Date('2025-01-15'),
        verifiedBy: admin._id,
        notes: 'Demo verification record.',
      },
      { upsert: true, runValidators: true },
    );
    // eslint-disable-next-line no-await-in-loop
    await EngineerPerformance.findOneAndUpdate(
      { engineer: engineer._id },
      {
        engineer: engineer._id,
        totalProjects: data.completedProjectsCount + 2,
        completedProjects: data.completedProjectsCount,
        ongoingProjects: 2,
        averageRating: data.rating,
        customerSatisfaction: 94,
        qualityScore: 91,
        onTimeCompletionPercentage: 92,
        safetyCompliance: 96,
      },
      { upsert: true, runValidators: true },
    );
  }
  return engineers;
}

async function seedPortfolio(engineers, admin) {
  const examples = [
    {
      engineer: engineers[0]._id,
      projectCode: 'PORT-YVT-101',
      projectName: 'Modern Family Residence',
      projectType: 'Residential',
      publicLocation: 'Yavatmal district',
      exactLocation: 'Private demo project address',
      privateClientName: 'Demo Client',
      description: 'A two-storey RCC home focused on natural light and efficient space planning.',
      builtUpArea: 2400,
      floors: 2,
      status: 'completed',
      completionDate: new Date('2025-02-15'),
      photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      plans2D: [],
      elevations3D: [],
      isPublicApproved: true,
      approvedBy: admin._id,
      approvedAt: new Date(),
    },
    {
      engineer: engineers[1]._id,
      projectCode: 'PORT-YVT-102',
      projectName: 'Commercial RCC Frame',
      projectType: 'Commercial',
      publicLocation: 'Yavatmal',
      exactLocation: 'Private demo commercial address',
      privateClientName: 'Demo Business',
      description: 'Structural coordination for a low-rise commercial building.',
      builtUpArea: 6200,
      floors: 3,
      status: 'completed',
      completionDate: new Date('2024-10-20'),
      photos: ['https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80'],
      plans2D: [],
      elevations3D: [],
      isPublicApproved: true,
      approvedBy: admin._id,
      approvedAt: new Date(),
    },
  ];
  for (const item of examples) {
    // eslint-disable-next-line no-await-in-loop
    await EngineerPortfolio.findOneAndUpdate({ projectCode: item.projectCode }, item, {
      upsert: true,
      runValidators: true,
    });
  }
}

async function seedPublicProject(engineer, admin) {
  const project = await Project.findOneAndUpdate(
    { projectCode: 'KABH-PROJ-0102' },
    {
      projectCode: 'KABH-PROJ-0102',
      engineer: engineer._id,
      customerName: 'Demo Customer',
      customerPhone: '9999999999',
      customerEmail: 'customer@example.invalid',
      projectType: 'Residential construction',
      constructionLocation: 'Private construction location, Yavatmal',
      publicLocation: 'Yavatmal district',
      builtUpArea: 2200,
      floors: 2,
      startDate: new Date('2026-03-01'),
      expectedCompletionDate: new Date('2026-12-15'),
      status: 'active',
      currentStage: 'structure',
      overallProgress: 42,
      estimatedCost: 4200000,
      adminManager: admin._id,
      publicSummary: 'First-floor slab completed and curing is in progress.',
      customerVisible: true,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  const stages = [
    { name: 'planning', sequence: 1, status: 'completed', progress: 100 },
    { name: 'design', sequence: 2, status: 'completed', progress: 100 },
    { name: 'approval', sequence: 3, status: 'completed', progress: 100 },
    {
      name: 'foundation',
      sequence: 4,
      status: 'completed',
      progress: 100,
      customerUpdate: 'Foundation work completed.',
    },
    {
      name: 'structure',
      sequence: 5,
      status: 'in_progress',
      progress: 42,
      customerUpdate: 'First-floor slab completed.',
      approvedPhotos: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'],
    },
  ];
  for (const stage of stages) {
    // eslint-disable-next-line no-await-in-loop
    await ProjectStage.findOneAndUpdate(
      { project: project._id, name: stage.name },
      { ...stage, project: project._id, customerVisible: true },
      { upsert: true, runValidators: true },
    );
  }
  const reviewProject = await Project.findOneAndUpdate(
    { projectCode: 'KABH-PROJ-0099' },
    {
      projectCode: 'KABH-PROJ-0099',
      engineer: engineer._id,
      customerName: 'Demo Review Customer',
      customerPhone: '9999999998',
      projectType: 'Residential construction',
      constructionLocation: 'Private completed project location',
      publicLocation: 'Yavatmal district',
      startDate: new Date('2024-03-01'),
      expectedCompletionDate: new Date('2024-12-01'),
      actualCompletionDate: new Date('2024-11-20'),
      status: 'completed',
      currentStage: 'handover',
      overallProgress: 100,
      adminManager: admin._id,
      publicSummary: 'Project completed and handed over.',
      customerVisible: false,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await Review.findOneAndUpdate(
    { project: reviewProject._id },
    {
      engineer: engineer._id,
      project: reviewProject._id,
      customerName: 'Demo Customer',
      publicCustomerLabel: 'Verified homeowner',
      rating: 4.8,
      review: 'Professional planning, clear communication and careful site supervision.',
      adminApproval: true,
      approvedBy: admin._id,
      approvedAt: new Date(),
    },
    { upsert: true, runValidators: true },
  );
}

async function run() {
  assertSeedCredentials();
  await connectDatabase();
  const admin = await seedAdmin();
  await seedCities();
  const engineers = await seedEngineers(admin);
  await seedPortfolio(engineers, admin);
  await seedPublicProject(engineers[0], admin);
  console.log('ॠKABH demo data is ready. Existing records were updated, not deleted.');
}

run()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
