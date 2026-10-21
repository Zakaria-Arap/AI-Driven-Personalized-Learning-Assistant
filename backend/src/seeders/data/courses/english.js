const { mc, topic, strand } = require('./_h');
module.exports = {
  code: 'ENG', name: 'English', pathway: 'compulsory',
  grades: {
    10: [
      strand('Grammar in Use', [
        topic('tenses', 'Tenses and verb forms', 'Use tenses correctly to show time in speech and writing.', [], [
          mc('Choose the correct sentence.', 'She has lived here since 2019.', ['She have lived here since 2019.', 'She is living here since 2019.', 'She live here since 2019.'], 'Since 2019 shows a time that started in the past and continues now, so use the present perfect: has lived.'),
          mc('Which sentence is in the past perfect tense?', 'They had left before the rain started.', ['They have left before the rain started.', 'They left before the rain starts.', 'They were leaving before the rain started.'], 'Past perfect = had + past participle. It shows an action finished before another past action.'),
          mc('Complete: By next year, I ____ my studies.', 'will have completed', ['will complete', 'have completed', 'am completing'], 'An action finished before a future time uses the future perfect: will have + past participle.', 2),
        ]),
        topic('punct', 'Punctuation and sentence structure', 'Punctuate sentences correctly and build simple, compound and complex sentences.', [], [
          mc('Which sentence is punctuated correctly?', 'Wanjiru, who is my cousin, won the race.', ['Wanjiru who is my cousin, won the race.', 'Wanjiru, who is my cousin won the race.', 'Wanjiru who, is my cousin, won the race.'], 'Extra information in a non-defining clause is placed between a pair of commas.'),
          mc('"I was tired, so I slept early." This is a ____ sentence.', 'compound', ['simple', 'complex', 'compound-complex'], 'Two independent clauses are joined by the conjunction so, which makes a compound sentence.'),
          mc('Which word correctly completes the sentence? The team lost ____ they played well.', 'although', ['because', 'so', 'therefore'], 'Although shows contrast. It makes the sentence complex.', 2),
        ]),
      ]),
      strand('Reading and Literature', [
        topic('figures', 'Figures of speech', 'Identify and explain figures of speech used in texts.', [], [
          mc('"The classroom was a beehive of activity." This is a ____.', 'metaphor', ['simile', 'personification', 'hyperbole'], 'A metaphor says one thing is another, with no like or as.'),
          mc('"The wind whispered through the trees." This is an example of ____.', 'personification', ['onomatopoeia', 'irony', 'oxymoron'], 'Giving human actions (whispering) to the wind is personification.'),
          mc('"I have told you a million times!" is an example of ____.', 'hyperbole', ['understatement', 'simile', 'euphemism'], 'Deliberate exaggeration for effect is hyperbole.'),
        ]),
        topic('infer', 'Reading comprehension: inference', 'Infer meaning that is not directly stated in a passage.', [], [
          mc('"Achieng checked her watch for the third time and sighed." What can we infer?', 'She is impatient or anxious.', ['She loves her watch.', 'She is asleep.', 'She is angry at her watch.'], 'Repeatedly checking the time and sighing suggest impatience.'),
          mc('Which is the best meaning of "reluctant" in "He was reluctant to speak"?', 'unwilling', ['eager', 'able', 'forced to shout'], 'Reluctant means hesitant or unwilling to do something.'),
          mc('The main idea of a paragraph is usually found in the ____.', 'topic sentence', ['title only', 'last word', 'footnote'], 'The topic sentence states the main idea that the other sentences support.'),
        ]),
      ]),
    ],
    11: [
      strand('Grammar in Use', [
        topic('reported', 'Reported speech', 'Change direct speech to reported speech accurately.', [], [
          mc('Change to reported speech: She said, "I am tired."', 'She said that she was tired.', ['She said that she is tired.', 'She said that I was tired.', 'She says that she was tired.'], 'In reported speech the present tense moves back (am to was) and I becomes she.'),
          mc('"Will you come tomorrow?" he asked. Reported speech:', 'He asked whether I would come the next day.', ['He asked will I come tomorrow.', 'He asked that I will come tomorrow.', 'He asked if I came tomorrow.'], 'Questions become statements with whether/if; will becomes would; tomorrow becomes the next day.', 2),
          mc('Which word changes when "here" is reported later?', 'there', ['now', 'it', 'this'], 'Here usually becomes there in reported speech.'),
        ]),
        topic('passive', 'Active and passive voice', 'Convert sentences between active and passive voice.', [], [
          mc('Passive form of "The teacher marked the books."', 'The books were marked by the teacher.', ['The books are marked by the teacher.', 'The teacher was marked by the books.', 'The books marked the teacher.'], 'Object becomes subject; use was/were + past participle.'),
          mc('Which sentence is in the passive voice?', 'The window was broken by the ball.', ['The ball broke the window.', 'The ball is breaking the window.', 'The window broke.'], 'The subject (window) receives the action.'),
          mc('The passive is most useful when ____.', 'the doer of the action is unknown or unimportant', ['we want to sound angry', 'we ask a question', 'we use only present tense'], 'Passives focus on the action or receiver rather than the doer.'),
        ]),
      ]),
      strand('Reading and Literature', [
        topic('poetry', 'Literary devices in poetry', 'Analyse sound and structure devices in poems.', [], [
          mc('Repetition of the same consonant sound at the start of words is called ____.', 'alliteration', ['assonance', 'rhyme', 'refrain'], 'Example: "Peter Piper picked".'),
          mc('A group of lines in a poem, set apart like a paragraph, is a ____.', 'stanza', ['verse of prose', 'chapter', 'caption'], 'A stanza is a unit of lines in a poem.'),
          mc('A poem with 14 lines and a fixed rhyme scheme is a ____.', 'sonnet', ['ballad', 'elegy', 'haiku'], 'A sonnet has 14 lines.'),
        ]),
        topic('formal', 'Formal letters and reports', 'Write formal letters and reports in the correct format.', [], [
          mc('A formal letter ends with "Yours faithfully" when the greeting is ____.', 'Dear Sir/Madam', ['Dear John', 'Hi team', 'Dear friend'], 'Use "faithfully" when you do not know the name of the person.'),
          mc('Which is the best subject line for a letter applying for a bursary?', 'APPLICATION FOR A SCHOOL BURSARY', ['I NEED MONEY', 'Hello Sir', 'About school'], 'A subject line is short, clear and in capitals or underlined.'),
          mc('A report should be written in ____.', 'formal, objective language', ['slang', 'text-message language', 'poetry'], 'Reports use formal, factual language.'),
        ]),
      ]),
    ],
    12: [
      strand('Grammar in Use', [
        topic('cond', 'Conditional sentences', 'Use conditional sentences to show real and unreal situations.', [], [
          mc('Complete: If it rains tomorrow, we ____ at home.', 'will stay', ['would stay', 'stayed', 'had stayed'], 'First conditional: if + present simple, will + verb.'),
          mc('Complete: If I were you, I ____ apologise.', 'would', ['will', 'did', 'had'], 'Second conditional for an imagined situation: if + past, would + verb.'),
          mc('Complete: If she had studied, she ____ the exam.', 'would have passed', ['will pass', 'would pass', 'passed'], 'Third conditional (unreal past): if + past perfect, would have + past participle.', 2),
        ]),
        topic('register', 'Register and style', 'Choose language that suits the audience and purpose.', [], [
          mc('Which sentence is the most formal?', 'We regret to inform you that your application was unsuccessful.', ['Sorry, you did not get it.', 'Bad luck, mate.', 'No luck this time.'], 'Formal register avoids slang and contractions.'),
          mc('Using "gonna" and "wanna" is appropriate in ____.', 'informal conversation', ['a legal contract', 'a job application', 'a formal speech'], 'These are informal contractions.'),
          mc('The tone of a text is ____.', 'the writer\'s attitude to the subject', ['the number of paragraphs', 'the font used', 'the title length'], 'Tone shows attitude: serious, humorous, angry and so on.'),
        ]),
      ]),
      strand('Writing and Literature', [
        topic('argue', 'Argumentative writing', 'Build a clear argument with evidence and a counter-argument.', [], [
          mc('A strong argumentative essay should include ____.', 'a clear claim supported by evidence', ['only personal feelings', 'jokes in every paragraph', 'no conclusion'], 'Claim + evidence + reasoning is the core.'),
          mc('A counter-argument is ____.', 'an opposing view that the writer answers', ['a spelling error', 'the thesis', 'a quotation'], 'Addressing opposing views makes the essay more convincing.'),
          mc('Which connective best introduces a contrast?', 'However', ['Therefore', 'Moreover', 'Similarly'], 'However signals a contrast.'),
        ]),
        topic('critical', 'Critical reading of literature', 'Analyse theme, character and setting in set texts.', [], [
          mc('The central message of a literary work is its ____.', 'theme', ['plot only', 'title', 'blurb'], 'Theme is the underlying message or idea.'),
          mc('A character who changes significantly in a story is a ____ character.', 'dynamic', ['flat', 'static', 'minor'], 'Dynamic characters develop; static characters stay the same.'),
          mc('The time and place of a story make up its ____.', 'setting', ['plot', 'theme', 'conflict'], 'Setting = when and where.'),
        ]),
      ]),
    ],
  },
};
