const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'HIST', name: 'History and Citizenship', pathway: 'social',
  grades: {
    10: [
      strand('Introduction to History', [
        topic('sources', 'Sources of history', 'Distinguish types of sources of historical information.', [], [
          mc('Which is a primary source?', 'A letter written during the event', ['A textbook written later', 'An encyclopaedia', 'A documentary made today'], 'Primary sources come from the time of the event.'),
          mc('The study of past human life through excavated remains is ____.', 'archaeology', ['anthropology', 'linguistics', 'sociology'], 'Archaeologists dig up and study artefacts.'),
          mc('A disadvantage of oral traditions is that they ____.', 'can change as they are passed on', ['are written', 'are always accurate', 'never mention people'], 'Memory and retelling can distort details.'),
        ]),
        topic('egypt', 'Early civilisations: Egypt', 'Describe the Nile valley civilisation.', [], [
          mc('Ancient Egyptian civilisation developed along the River ____.', 'Nile', ['Niger', 'Congo', 'Tana'], 'The Nile flooded and made the soil fertile.'),
          mc('Egyptian writing using pictures was called ____.', 'hieroglyphics', ['cuneiform', 'Latin script', 'Braille'], 'Hieroglyphics used picture symbols.'),
          mc('The pyramids were built as ____.', 'tombs for pharaohs', ['markets', 'schools', 'harbours'], 'Pharaohs were buried with treasures.'),
        ]),
      ]),
      strand('Kenyan Society and Citizenship', [
        topic('commun', 'Organisation of Kenyan communities', 'Describe political and social organisation before colonial rule.', [], [
          mc('The Agikuyu council of elders was called ____.', 'Kiama', ['Orkoiyot', 'Ruoth', 'Laibon'], 'Kiama made laws and settled disputes.'),
          mc('The Nandi religious and political leader was the ____.', 'Orkoiyot', ['Kiama', 'Ngwatio', 'Ruoth'], 'The Orkoiyot was a seer and leader.'),
          mc('The Luo traditional leader of a clan or chiefdom was the ____.', 'Ruoth', ['Kiama', 'Orkoiyot', 'Laibon'], 'Ruoth = chief.'),
        ]),
        topic('citiz', 'Citizenship and national values', 'Explain rights, duties and national values.', [], [
          mc('The national values and principles of governance are in Article ____ of the 2010 Constitution.', '10', ['1', '43', '260'], 'Article 10 lists patriotism, unity, equity, human dignity and so on.'),
          mc('Which is a duty of a citizen?', 'Paying taxes', ['Avoiding school', 'Ignoring the law', 'Voting twice'], 'Citizens must pay taxes and obey the law.'),
          mc('A person born to a Kenyan parent is a citizen by ____.', 'birth', ['marriage', 'registration', 'naturalisation only'], 'Citizenship by birth is set by the Constitution.', 2),
        ]),
      ]),
    ],
    11: [
      strand('Colonialism and Independence', [
        topic('colon', 'Colonial rule in Africa and Kenya', 'Explain causes and effects of colonial rule.', [], [
          num('The Berlin Conference that divided Africa began in which year?', 1884, 'It was held in 1884 to 1885.'),
          mc('The British system of ruling through local leaders was called ____.', 'indirect rule', ['direct rule', 'assimilation', 'apartheid'], 'Indirect rule used chiefs and local institutions.'),
          mc('The Kenya-Uganda Railway ran from ____.', 'Mombasa to Kisumu', ['Nairobi to Eldoret', 'Mombasa to Nairobi only', 'Kisumu to Kampala'], 'It reached Kisumu on Lake Victoria in 1901.'),
        ]),
        topic('nation', 'Nationalism and independence in Kenya', 'Describe the struggle for independence.', [], [
          mc('The Mau Mau uprising took place mainly in the ____.', '1950s', ['1920s', '1970s', '1990s'], 'It began in 1952; a state of emergency was declared.'),
          num('In which year did Kenya gain independence?', 1963, 'On 12 December 1963.'),
          mc('The first President of Kenya was ____.', 'Jomo Kenyatta', ['Daniel arap Moi', 'Mwai Kibaki', 'Tom Mboya'], 'He served from 1964 to 1978.'),
        ]),
      ]),
      strand('World History and Governance', [
        topic('wars', 'The World Wars', 'Explain causes and effects of the world wars.', [], [
          num('In which year did the First World War begin?', 1914, 'It began in July 1914.'),
          num('In which year did the Second World War end?', 1945, 'It ended in 1945.'),
          mc('The peace treaty that ended the First World War with Germany was the Treaty of ____.', 'Versailles', ['Vienna', 'Berlin', 'Nairobi'], 'Signed in 1919.'),
        ]),
        topic('devol', 'Devolved government in Kenya', 'Describe the structure of devolution.', [], [
          num('How many counties does Kenya have?', 47, 'The 2010 Constitution created 47 counties.'),
          mc('The head of a county government is the ____.', 'governor', ['senator', 'chief', 'speaker'], 'Elected governors lead county executives.'),
          mc('Devolution aims to ____.', 'bring services closer to the people', ['remove elections', 'abolish taxes', 'close schools'], 'Power and resources are shared with counties.'),
        ]),
      ]),
    ],
    12: [
      strand('Global Relations', [
        topic('cold', 'The Cold War and decolonisation', 'Explain the Cold War and its effects on Africa.', [], [
          mc('The Cold War was mainly a rivalry between ____.', 'the USA and the USSR', ['Britain and France', 'China and India', 'Kenya and Uganda'], 'Two superpowers with opposing ideologies.'),
          mc('NATO was a military alliance led by ____.', 'the USA and Western countries', ['the USSR', 'the African Union', 'China'], 'Founded in 1949.'),
          mc('Many African countries became independent mainly in the ____.', '1960s', ['1860s', '1910s', '1990s'], '1960 is called the Year of Africa.'),
        ]),
        topic('intl', 'International organisations', 'Describe the UN, AU and EAC.', [], [
          num('In which year was the United Nations founded?', 1945, 'After the Second World War.'),
          mc('The African Union replaced the ____.', 'Organisation of African Unity', ['League of Nations', 'Commonwealth', 'EAC'], 'The AU was launched in 2002.'),
          mc('The East African Community headquarters are in ____.', 'Arusha', ['Nairobi', 'Kampala', 'Kigali'], 'Arusha, Tanzania.'),
        ]),
      ]),
      strand('Constitution and Rights', [
        topic('const', 'The Constitution of Kenya 2010', 'Explain key features of the Constitution.', [], [
          num('In which year was the current Constitution of Kenya promulgated?', 2010, 'It was promulgated on 27 August 2010.'),
          mc('The Bill of Rights is found in Chapter ____.', 'Four', ['One', 'Six', 'Ten'], 'Chapter 4 protects fundamental rights.'),
          mc('The three arms of government are the Executive, Legislature and ____.', 'Judiciary', ['Police', 'Military', 'Media'], 'Separation of powers.'),
        ]),
        topic('rights', 'Democracy and human rights', 'Describe democracy and human rights.', [], [
          num('In which year was the Universal Declaration of Human Rights adopted?', 1948, 'By the UN General Assembly in 1948.'),
          mc('Free and fair elections are a feature of ____.', 'democracy', ['dictatorship', 'monarchy only', 'anarchy'], 'Citizens choose leaders by voting.'),
          mc('Rule of law means ____.', 'everyone is subject to the law', ['leaders are above the law', 'laws are secret', 'only courts make laws'], 'No one is above the law.'),
        ]),
      ]),
    ],
  },
};
