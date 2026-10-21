const { SchoolSetting, School } = require('../models');
module.exports = {
  firstSchool: () => School.findOne({ order: [['id', 'ASC']] }),
  schoolByCode: (code) => School.findOne({ where: { code } }),
  forSchool: (schoolId) => SchoolSetting.findOne({ where: { schoolId } }),
  upsert: async (schoolId, patch) => {
    const row = await SchoolSetting.findOne({ where: { schoolId } });
    return row ? row.update(patch) : SchoolSetting.create({ schoolId, ...patch });
  },
};
