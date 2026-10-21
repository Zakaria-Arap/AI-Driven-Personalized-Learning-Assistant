const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
module.exports = { addMinutes, addDays, startOfDay };
