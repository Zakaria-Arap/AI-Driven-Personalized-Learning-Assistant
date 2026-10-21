const { selectEmailRecipients } = require('../../src/services/engagement/emailRecipients');

describe('selectEmailRecipients', () => {
  const users = [
    { id: 1, role: 'admin', email: 'admin@example.com', status: 'active' },
    { id: 2, role: 'tutor', email: 'tutor@example.com', status: 'active' },
    { id: 3, role: 'learner', email: 'learner@example.com', status: 'active' },
    { id: 4, role: 'parent', email: 'parent@example.com', status: 'active' },
    { id: 5, role: 'learner', email: 'inactive@example.com', status: 'inactive' },
    { id: 6, role: 'learner', email: null, status: 'active' },
    { id: 7, role: 'learner', email: 'invalid', status: 'active' },
    { id: 8, role: 'learner', email: 'dupe@example.com', status: 'active' },
    { id: 9, role: 'tutor', email: 'dupe@example.com', status: 'active' },
  ];

  test('excludes author', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    expect(result.find(u => u.id === 1)).toBeUndefined();
  });

  test('audience=all includes all roles except author', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    const roles = result.map(u => u.role);
    expect(roles).toContain('tutor');
    expect(roles).toContain('learner');
    expect(roles).toContain('parent');
  });

  test('audience=tutors includes only tutors', () => {
    const result = selectEmailRecipients({ audience: 'tutors', authorId: 1, users });
    expect(result.every(u => u.role === 'tutor')).toBe(true);
  });

  test('audience=learners includes only learners', () => {
    const result = selectEmailRecipients({ audience: 'learners', authorId: 1, users });
    expect(result.every(u => u.role === 'learner')).toBe(true);
  });

  test('audience=parents includes only parents', () => {
    const result = selectEmailRecipients({ audience: 'parents', authorId: 1, users });
    expect(result.every(u => u.role === 'parent')).toBe(true);
  });

  test('excludes inactive users', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    expect(result.find(u => u.id === 5)).toBeUndefined();
  });

  test('excludes users without email', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    expect(result.find(u => u.id === 6)).toBeUndefined();
  });

  test('excludes users with invalid email', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    expect(result.find(u => u.id === 7)).toBeUndefined();
  });

  test('dedupes by email', () => {
    const result = selectEmailRecipients({ audience: 'all', authorId: 1, users });
    const dupes = result.filter(u => u.email === 'dupe@example.com');
    expect(dupes.length).toBe(1);
  });
});
