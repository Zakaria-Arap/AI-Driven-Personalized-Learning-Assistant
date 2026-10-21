const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'CS', name: 'Computer Science', pathway: 'stem',
  grades: {
    10: [
      strand('Computer Systems', [
        topic('hw', 'Hardware and software', 'Distinguish hardware, system software and application software.', [], [
          mc('Which is an example of an operating system?', 'Linux', ['Microsoft Word', 'Google Chrome', 'Keyboard'], 'An operating system manages hardware and software.'),
          mc('The brain of the computer that executes instructions is the ____.', 'CPU', ['RAM', 'monitor', 'hard disk'], 'The CPU fetches, decodes and executes instructions.'),
          mc('Which is an output device?', 'Printer', ['Scanner', 'Mouse', 'Microphone'], 'Output devices present results to the user.'),
        ]),
        topic('numsys', 'Number systems', 'Convert between binary, decimal and hexadecimal.', [], [
          num('Convert binary 1010 to decimal.', 10, '8 + 0 + 2 + 0 = 10'),
          num('Convert decimal 13 to binary.', 1101, '13 = 8 + 4 + 1, so 1101'),
          num('What is the decimal value of hexadecimal A?', 10, 'A in hex is 10.'),
        ]),
      ]),
      strand('Programming and Networks', [
        topic('prog', 'Programming basics', 'Write and trace simple programs.', [], [
          num('What does print(2 + 3) display in Python?', 5, '2 + 3 = 5'),
          mc('A variable is ____.', 'a named storage location for data', ['a type of loop', 'a program error', 'a keyboard key'], 'It holds a value that can change.'),
          mc('Which statement repeats a block of code?', 'a loop', ['a comment', 'an import', 'a variable'], 'for and while are loops.'),
        ]),
        topic('net', 'Introduction to networks', 'Describe types of networks and protocols.', [], [
          mc('A network confined to a school building is a ____.', 'LAN', ['WAN', 'MAN', 'internet'], 'Local Area Network.'),
          mc('Which protocol is used to load web pages?', 'HTTP', ['SMTP', 'FTP', 'POP3'], 'HyperText Transfer Protocol.'),
          mc('The unique address of a device on a network is its ____.', 'IP address', ['URL', 'password', 'file name'], 'Devices are identified by an IP address.'),
        ]),
      ]),
    ],
    11: [
      strand('Problem Solving and Data', [
        topic('algo', 'Algorithms and flowcharts', 'Design and trace algorithms.', [], [
          num('What is the final value of total? total = 0; for i in 1, 2, 3: total = total + i.', 6, '1 + 2 + 3 = 6'),
          mc('In a flowchart, a diamond shape represents ____.', 'a decision', ['start or end', 'input', 'a process'], 'A decision has yes/no branches.'),
          mc('An algorithm is ____.', 'a step-by-step set of instructions to solve a problem', ['a type of computer', 'a programming language', 'a virus'], 'It must be clear and finite.'),
        ]),
        topic('datarep', 'Data representation', 'Represent text, images and sizes in binary.', [], [
          num('What is the ASCII code of the capital letter A?', 65, 'A = 65, B = 66 and so on.'),
          num('An image is 100 by 100 pixels with 8 bits per pixel. What is its size in bytes?', 10000, '100 x 100 = 10000 pixels\n8 bits = 1 byte each\n= 10000 bytes', 0, 2),
          num('How many bits are in 2 bytes?', 16, '1 byte = 8 bits, so 2 bytes = 16 bits'),
        ]),
      ]),
      strand('Databases and the Web', [
        topic('db', 'Databases and SQL', 'Query a relational database.', [], [
          mc('Which SQL command retrieves data from a table?', 'SELECT', ['INSERT', 'DELETE', 'CREATE'], 'SELECT reads rows.'),
          mc('A primary key ____.', 'uniquely identifies each record', ['stores images only', 'duplicates rows', 'is always a name'], 'No two records share a primary key.'),
          mc('A table row is also called a ____.', 'record', ['field', 'key', 'query'], 'A column is a field; a row is a record.'),
        ]),
        topic('web', 'Web design with HTML', 'Build simple web pages.', [], [
          mc('Which HTML tag creates a paragraph?', '<p>', ['<h1>', '<br>', '<img>'], '<p> wraps a paragraph.'),
          mc('Which tag creates a hyperlink?', '<a>', ['<link>', '<href>', '<p>'], 'The anchor tag with an href attribute.'),
          mc('CSS is used to ____.', 'style a web page', ['store data', 'send email', 'compile Java'], 'CSS controls colour, layout and fonts.'),
        ]),
      ]),
    ],
    12: [
      strand('Data and Security', [
        topic('ds', 'Data structures', 'Use stacks, queues and arrays.', [], [
          mc('A stack follows the rule ____.', 'last in, first out', ['first in, first out', 'random access only', 'sorted order'], 'LIFO.'),
          mc('A queue follows the rule ____.', 'first in, first out', ['last in, first out', 'largest first', 'alphabetical'], 'FIFO.'),
          num('An array has indexes starting at 0 and holds 10 items. What is the last index?', 9, 'Indexes run from 0 to 9.'),
        ]),
        topic('sec', 'Cybersecurity', 'Protect systems and data.', [], [
          mc('Sending fake emails to steal passwords is ____.', 'phishing', ['encryption', 'backup', 'compression'], 'Phishing tricks users into giving details.'),
          mc('A firewall ____.', 'filters network traffic', ['speeds up the CPU', 'stores files', 'prints documents'], 'It blocks unauthorised access.'),
          mc('Which is the strongest password?', 'Tr!ck9#Mango42', ['password', '12345678', 'myname'], 'Long, mixed characters are hard to guess.'),
        ]),
      ]),
      strand('Software Development and Society', [
        topic('sdlc', 'Software development life cycle', 'Describe the stages of software development.', [], [
          mc('Which stage comes first in the software life cycle?', 'Requirements analysis', ['Testing', 'Maintenance', 'Deployment'], 'You must understand what is needed first.'),
          mc('Testing a program with real users before release is called ____ testing.', 'user acceptance', ['syntax', 'unit only', 'hardware'], 'Users confirm it meets their needs.'),
          mc('Fixing bugs after release is ____.', 'maintenance', ['analysis', 'design', 'implementation'], 'Maintenance keeps software working.'),
        ]),
        topic('ai', 'Artificial intelligence and ethics', 'Discuss uses and ethics of AI.', [], [
          mc('Machine learning means computers ____.', 'learn patterns from data', ['are told every rule by hand', 'never make mistakes', 'work without electricity'], 'Models improve with examples.'),
          mc('Bias in an AI system can come from ____.', 'unbalanced training data', ['the screen size', 'the power cable', 'the keyboard'], 'Biased data gives biased results.'),
          mc('Respecting people\'s private data is an example of ____.', 'ethical computing', ['overclocking', 'compiling', 'defragmentation'], 'Privacy is a core ethical principle.'),
        ]),
      ]),
    ],
  },
};
