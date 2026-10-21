// Loads a curriculum JSON file (see src/seeders/data/mathGrade10.json for the format) into the database.
// Safe to run twice: subjects, strands and topics are matched by name; questions are added only to empty topics.
module.exports = async function importCurriculum(models, data) {
  const { Subject, Strand, Topic, Question } = models;
  const [subject] = await Subject.findOrCreate({ where: { code: data.subject.code }, defaults: data.subject });
  const keyToTopic = new Map();
  const pending = [];
  let sp = 0;
  for (const s of data.strands) {
    const [strand] = await Strand.findOrCreate({ where: { subjectId: subject.id, name: s.name }, defaults: { position: sp++ } });
    let tp = 0;
    for (const t of s.topics) {
      const [topic] = await Topic.findOrCreate({ where: { strandId: strand.id, title: t.title }, defaults: { outcome: t.outcome, position: tp++ } });
      keyToTopic.set(t.key, topic);
      pending.push({ topic, t });
      if ((await Question.count({ where: { topicId: topic.id } })) === 0) {
        await Question.bulkCreate(t.questions.map((q) => ({ ...q, topicId: topic.id, reviewed: false })));
      }
    }
  }
  for (const { topic, t } of pending) {
    const prereqs = (t.prereq || []).map((k) => keyToTopic.get(k)).filter(Boolean);
    if (prereqs.length) await topic.setPrerequisites(prereqs);
  }
  return { subject, topics: keyToTopic.size };
};
