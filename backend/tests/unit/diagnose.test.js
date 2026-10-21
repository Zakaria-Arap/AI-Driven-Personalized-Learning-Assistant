const { diagnose } = require('../../src/services/ai/diagnose');

describe('Diagnose Module', () => {
  test('recognizes correct answer', () => {
    const q = { answer: '42', type: 'numeric' };
    const result = diagnose(q, '42');
    expect(result.verdict).toBe('correct');
  });

  test('blank attempt', () => {
    const q = { answer: '42', type: 'numeric' };
    const result = diagnose(q, '');
    expect(result.verdict).toBe('wrong');
    expect(result.tag).toBe('blank');
  });

  test('detects sign error', () => {
    const q = { answer: '10', type: 'numeric' };
    const result = diagnose(q, '-10');
    expect(result.verdict).toBe('wrong');
    expect(result.error).toContain('sign');
    expect(result.tag).toBe('sign_error');
  });

  test('detects decimal/power of 10 error', () => {
    const q = { answer: '100', type: 'numeric' };
    const result = diagnose(q, '1000');
    expect(result.verdict).toBe('wrong');
    expect(result.error).toContain('power of ten');
    expect(result.tag).toBe('decimal_error');
  });

  test('detects factor of 2 error', () => {
    const q = { answer: '50', type: 'numeric' };
    const result = diagnose(q, '100');
    expect(result.verdict).toBe('wrong');
    expect(result.tag).toBe('factor_error');
  });

  test('detects rounding issues (very close)', () => {
    const q = { answer: '100', type: 'numeric' };
    const result = diagnose(q, '100.5');
    expect(result.verdict).toBe('close');
    expect(result.tag).toBe('rounding');
  });

  test('uses common mistakes if provided', () => {
    const q = {
      answer: '24',
      type: 'numeric',
      commonMistakes: [
        { answer: '12', reason: 'forgot to double', hint: 'Remember to multiply by 2', tag: 'halved' }
      ]
    };
    const result = diagnose(q, '12');
    expect(result.verdict).toBe('wrong');
    expect(result.error).toBe('forgot to double');
    expect(result.tag).toBe('halved');
  });

  test('NEVER reveals the correct answer in any nudge', () => {
    const q = { answer: '42', type: 'numeric' };
    const tests = [
      ['40', 'wrong'],
      ['84', 'wrong'],
      ['420', 'wrong'],
      ['4.2', 'wrong'],
      ['-42', 'wrong']
    ];
    
    tests.forEach(([attempt, expected]) => {
      const result = diagnose(q, attempt);
      expect(result.verdict).toBe(expected);
      expect(result.nudge).not.toContain('42');
      expect(result.error).not.toContain('42');
    });
  });

  test('handles choice questions', () => {
    const q = { answer: 'B. Photosynthesis', type: 'choice' };
    const result = diagnose(q, 'A. Respiration');
    expect(result.verdict).toBe('wrong');
    expect(result.nudge).not.toContain('Photosynthesis');
  });

  test('reciprocal error detection', () => {
    const q = { answer: '0.5', type: 'numeric' };
    const result = diagnose(q, '2');
    expect(result.tag).toBe('reciprocal_error');
  });
});
