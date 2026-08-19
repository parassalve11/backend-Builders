function normalizeCityCode(cityCode, city) {
  const source = cityCode || city || 'GEN';
  return source.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
}

async function generatePseudonymCode(Engineer, { cityCode, city }) {
  const prefix = `ENG-${normalizeCityCode(cityCode, city)}`;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
    const candidate = `${prefix}-${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await Engineer.exists({ pseudonymCode: candidate }))) return candidate;
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

module.exports = { generatePseudonymCode, normalizeCityCode };
