const fs = require('fs');

const data = {
  lineage: 'esper_mentalist',
  esper_archetypes: {},
  mentalist_framework: {}
};

fs.writeFileSync('public/data/powers-espers.json', JSON.stringify(data, null, 2));
