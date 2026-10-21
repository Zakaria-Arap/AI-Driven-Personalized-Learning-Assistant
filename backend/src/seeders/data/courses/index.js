// All core senior-school courses. Each file: { code, name, pathway, grades: { 10: [strands], 11: [...], 12: [...] } }.
// Question banks are starter material (reviewed = false): the subject teacher must review and extend them.
module.exports = [
  require('./english'), require('./kiswahili'), require('./math'),
  require('./biology'), require('./chemistry'), require('./physics'), require('./computerscience'),
  require('./history'), require('./geography'), require('./cre'), require('./business'),
];
module.exports.PATHWAYS = {
  compulsory: { name: 'Compulsory subjects' },
  stem: { name: 'STEM' },
  social: { name: 'Social Sciences' },
};
