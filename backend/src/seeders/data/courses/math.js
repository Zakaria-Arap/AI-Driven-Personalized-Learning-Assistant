const { num, topic, strand } = require('./_h');
module.exports = {
  code: 'MATH', name: 'Core Mathematics', pathway: 'compulsory',
  grades: {
    10: require('../mathGrade10.json').strands,
    11: [
      strand('Numbers and Algebra', [
        topic('seq', 'Sequences and series', 'Find terms and sums of arithmetic and geometric sequences.', [], [
          num('The arithmetic sequence is 3, 7, 11, 15, ... Find the 10th term.', 39, 'a = 3, d = 4\nT10 = a + 9d = 3 + 36 = 39'),
          num('Find the sum of the first 10 terms of an arithmetic sequence with first term 2 and common difference 3.', 155, 'S10 = n/2 (2a + (n-1)d)\n= 5 (4 + 27)\n= 155', 0, 2),
          num('The geometric sequence is 2, 6, 18, ... Find the 5th term.', 162, 'r = 3\nT5 = a r^4 = 2 x 81 = 162', 0, 2),
        ]),
        topic('matrix', 'Matrices', 'Add, multiply and find determinants of 2 by 2 matrices.', [], [
          num('Find the determinant of the matrix with rows (3, 2) and (1, 4).', 10, 'det = ad - bc = 3x4 - 2x1 = 12 - 2 = 10'),
          num('A has rows (1, 2) and (3, 4). B has rows (0, 1) and (1, 0). Find the top-left element of AB.', 2, 'Row 1 of A times column 1 of B = 1x0 + 2x1 = 2'),
          num('The determinant of the matrix with rows (x, 2) and (3, 4) is 2. Find x.', 2, '4x - 6 = 2\n4x = 8\nx = 2', 0, 2),
        ]),
      ]),
      strand('Measurement and Geometry', [
        topic('vec', 'Vectors', 'Work with column vectors: magnitude, addition and scalar product.', [], [
          num('Find the magnitude of the vector (3, 4).', 5, '|v| = sqrt(3^2 + 4^2) = sqrt(25) = 5'),
          num('a = (2, 3) and b = (1, -1). Find the x-component of a + 2b.', 4, 'a + 2b = (2 + 2, 3 - 2) = (4, 1)\nx-component = 4'),
          num('Find the scalar (dot) product of (2, 3) and (4, -1).', 5, '2x4 + 3x(-1) = 8 - 3 = 5', 0, 2),
        ]),
      ]),
      strand('Statistics and Probability', [
        topic('prob', 'Probability', 'Calculate probabilities of simple and combined events.', [], [
          num('A bag has 3 red and 5 blue balls. Find the probability of picking a red ball.', '3/8', 'P(red) = 3 / (3 + 5) = 3/8', 0.005),
          num('Two fair coins are tossed. Find the probability of two heads.', '1/4', '1/2 x 1/2 = 1/4', 0.005),
          num('A and B are independent events with P(A) = 0.3 and P(B) = 0.5. Find P(A and B).', 0.15, 'Independent events: multiply.\n0.3 x 0.5 = 0.15', 0.005, 2),
        ]),
      ]),
    ],
    12: [
      strand('Calculus', [
        topic('diff', 'Differentiation', 'Differentiate polynomials and find gradients and stationary points.', [], [
          num('Find the gradient of y = 3x^2 at x = 2.', 12, 'dy/dx = 6x\nAt x = 2: 12'),
          num('Find the gradient of y = x^3 - 4x at x = 1.', -1, 'dy/dx = 3x^2 - 4\nAt x = 1: 3 - 4 = -1', 0, 2),
          num('Find the x-value of the stationary point of y = x^2 - 6x + 5.', 3, 'dy/dx = 2x - 6 = 0\nx = 3', 0, 2),
        ]),
        topic('integ', 'Integration', 'Integrate polynomials and find areas under curves.', ['diff'], [
          num('Evaluate the integral of (2x + 3) dx from 0 to 2.', 10, '[x^2 + 3x] from 0 to 2 = (4 + 6) - 0 = 10'),
          num('Evaluate the integral of 3x^2 dx from 1 to 2.', 7, '[x^3] from 1 to 2 = 8 - 1 = 7'),
          num('Find the area under y = 4 between x = 1 and x = 5.', 16, 'Rectangle: height 4, width 4\nArea = 16'),
        ]),
      ]),
      strand('Statistics and Probability', [
        topic('disp', 'Measures of dispersion', 'Calculate range, variance and standard deviation.', [], [
          num('Find the range of 3, 9, 5, 12, 7.', 9, 'Range = largest - smallest = 12 - 3 = 9'),
          num('Find the variance of 2, 4, 6, 8, 10.', 8, 'Mean = 6\nSum of squared deviations = 16+4+0+4+16 = 40\nVariance = 40/5 = 8', 0, 2),
          num('Find the standard deviation of 2, 4, 6, 8, 10 (2 decimal places).', 2.83, 'sd = sqrt(8) = 2.83', 0.01, 2),
        ]),
      ]),
      strand('Financial Mathematics', [
        topic('finance', 'Compound interest and depreciation', 'Solve problems on simple interest, compound interest and depreciation.', [], [
          num('Find the simple interest on KES 5000 at 8% per year for 3 years.', 1200, 'I = PRT/100 = 5000 x 8 x 3 / 100 = 1200'),
          num('KES 10000 is invested at 10% per year compound interest. Find the amount after 2 years.', 12100, '10000 x 1.1^2 = 12100', 0, 2),
          num('A car worth KES 800000 depreciates by 10% each year. Find its value after 2 years.', 648000, '800000 x 0.9^2 = 648000', 0, 2),
        ]),
      ]),
    ],
  },
};
