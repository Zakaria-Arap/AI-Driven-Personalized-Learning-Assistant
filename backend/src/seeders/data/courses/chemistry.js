const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'CHEM', name: 'Chemistry', pathway: 'stem',
  grades: {
    10: [
      strand('Matter and Structure', [
        topic('atom', 'Atomic structure and the periodic table', 'Describe atomic structure and periodic trends.', [], [
          num('An atom has 11 protons and 12 neutrons. What is its mass number?', 23, 'Mass number = protons + neutrons = 11 + 12 = 23'),
          mc('The electron arrangement of magnesium (atomic number 12) is ____.', '2, 8, 2', ['2, 8, 1', '2, 10', '8, 4'], '12 electrons fill shells 2, 8, then 2.'),
          mc('An element with 7 electrons in its outer shell is in Group ____.', 'VII (17)', ['I (1)', 'II (2)', 'VIII (18)'], 'Valence electrons give the group number: halogens.'),
        ]),
        topic('bond', 'Chemical bonding', 'Distinguish ionic, covalent and metallic bonding.', ['atom'], [
          mc('Sodium chloride is held together by ____ bonds.', 'ionic', ['covalent', 'metallic', 'hydrogen'], 'Sodium gives an electron to chlorine, forming Na+ and Cl-.'),
          mc('In a covalent bond, atoms ____.', 'share pairs of electrons', ['transfer electrons completely', 'lose all electrons', 'share protons'], 'Covalent bonding is electron sharing.'),
          mc('Metals conduct electricity because they have ____.', 'delocalised electrons', ['free protons', 'ions only', 'no electrons'], 'Free-moving electrons carry charge.'),
        ]),
      ]),
      strand('Quantities and Reactions', [
        topic('mole', 'The mole concept', 'Calculate relative formula mass, moles and mass.', [], [
          num('Find the relative formula mass of CO2 (C = 12, O = 16).', 44, '12 + 2 x 16 = 44'),
          num('How many moles are in 88 g of CO2 (relative formula mass 44)?', 2, 'moles = mass / Mr = 88 / 44 = 2'),
          num('What mass of NaOH is in 0.5 mol? (Na = 23, O = 16, H = 1)', 20, 'Mr = 40\nmass = 0.5 x 40 = 20 g', 0, 2),
        ]),
        topic('acid', 'Acids, bases and salts', 'Describe properties and reactions of acids and bases.', [], [
          num('What is the pH of a neutral solution?', 7, 'Neutral solutions have pH 7.'),
          mc('Hydrochloric acid reacts with sodium hydroxide to form ____.', 'sodium chloride and water', ['sodium and chlorine', 'hydrogen only', 'sodium oxide'], 'Neutralisation: acid + base gives salt + water.'),
          mc('Universal indicator turns ____ in a strong acid.', 'red', ['blue', 'green', 'purple'], 'Red is for strongly acidic solutions.'),
        ]),
      ]),
    ],
    11: [
      strand('Energy and Rates', [
        topic('rate', 'Rates of reaction', 'Explain factors affecting reaction rate.', [], [
          mc('Increasing temperature increases the rate of reaction because particles ____.', 'collide more often and with more energy', ['become larger', 'lose mass', 'stop moving'], 'More frequent and more energetic collisions.'),
          num('60 cm3 of gas is produced in 20 s. What is the average rate in cm3 per second?', 3, 'rate = 60 / 20 = 3'),
          mc('A catalyst ____.', 'speeds up a reaction and is not used up', ['is used up', 'slows a reaction', 'changes the products'], 'It provides an alternative path with lower activation energy.'),
        ]),
        topic('energy', 'Energetics', 'Calculate heat changes and classify reactions.', [], [
          mc('An exothermic reaction ____.', 'releases heat to the surroundings', ['absorbs heat', 'has no energy change', 'always needs a catalyst'], 'The temperature of the surroundings rises.'),
          num('100 g of water rises by 5 C. Find the heat gained in joules (c = 4.2 J per g per C).', 2100, 'Q = m c dT = 100 x 4.2 x 5 = 2100 J', 0, 2),
          mc('The enthalpy change (delta H) of an exothermic reaction is ____.', 'negative', ['positive', 'zero', 'infinite'], 'Energy leaves the system.'),
        ]),
      ]),
      strand('Electricity and Carbon Compounds', [
        topic('electro', 'Electrochemistry', 'Describe electrolysis and redox at electrodes.', [], [
          mc('During electrolysis, positive ions move to the ____.', 'cathode', ['anode', 'salt bridge', 'wire'], 'Cations are attracted to the negative electrode (cathode).'),
          mc('Oxidation is ____.', 'loss of electrons', ['gain of electrons', 'gain of protons', 'loss of neutrons'], 'OIL RIG: Oxidation Is Loss.'),
          mc('In molten sodium chloride, the product at the anode is ____.', 'chlorine gas', ['sodium metal', 'hydrogen', 'oxygen'], 'Chloride ions lose electrons to form chlorine.', 2),
        ]),
        topic('organic', 'Introduction to organic chemistry', 'Name and describe alkanes and alkenes.', [], [
          num('How many hydrogen atoms does an alkane with 5 carbon atoms have? (CnH2n+2)', 12, '2(5) + 2 = 12'),
          mc('Which test shows that a compound is unsaturated?', 'It decolourises bromine water', ['It turns litmus red', 'It burns green', 'It conducts electricity'], 'Alkenes add bromine.'),
          mc('The functional group of an alkene is ____.', 'C=C double bond', ['-OH', '-COOH', 'C-C single bond only'], 'A carbon-carbon double bond.'),
        ]),
      ]),
    ],
    12: [
      strand('Equilibrium and Redox', [
        topic('equil', 'Chemical equilibrium', 'Apply Le Chatelier\'s principle.', [], [
          mc('Increasing pressure in N2 + 3H2 <=> 2NH3 shifts the equilibrium ____.', 'to the right (fewer gas moles)', ['to the left', 'nowhere', 'to remove nitrogen'], 'The right side has 2 moles of gas against 4 on the left.'),
          mc('A catalyst in the Haber process is ____.', 'iron', ['platinum wire only', 'sodium', 'copper oxide'], 'Finely divided iron speeds up the reaction.'),
          mc('At equilibrium, the forward and backward reactions ____.', 'occur at equal rates', ['stop completely', 'only go forward', 'use up all reactants'], 'Dynamic equilibrium.'),
        ]),
        topic('redox', 'Oxidation numbers and redox', 'Assign oxidation numbers and identify oxidising agents.', [], [
          num('What is the oxidation number of manganese in KMnO4?', 7, 'K = +1, O = -2 x 4 = -8, so Mn = +7'),
          num('What is the oxidation number of sulphur in H2SO4?', 6, '2(+1) + S + 4(-2) = 0, so S = +6'),
          mc('A reducing agent ____.', 'loses electrons', ['gains electrons', 'is always oxygen', 'is reduced'], 'It donates electrons and is itself oxidised.'),
        ]),
      ]),
      strand('Organic and Industrial Chemistry', [
        topic('polymer', 'Organic reactions and polymers', 'Describe addition polymerisation, esters and soaps.', [], [
          mc('Poly(ethene) is made from ethene by ____.', 'addition polymerisation', ['condensation polymerisation', 'fermentation', 'cracking'], 'Many ethene molecules add together.'),
          mc('An alcohol reacts with a carboxylic acid to form ____.', 'an ester and water', ['an alkene', 'a salt', 'a soap'], 'Esterification.'),
          mc('Soap is made by heating fat with ____.', 'sodium hydroxide', ['hydrochloric acid', 'water only', 'ethanol only'], 'Saponification.'),
        ]),
        topic('industry', 'Industrial chemistry and the environment', 'Outline industrial processes and pollution.', [], [
          mc('The Contact process makes ____.', 'sulphuric acid', ['ammonia', 'ethanol', 'chlorine'], 'Sulphur dioxide is oxidised using vanadium(V) oxide.'),
          mc('Acid rain is mainly caused by ____.', 'sulphur dioxide and nitrogen oxides', ['oxygen', 'argon', 'water vapour'], 'They form acids in rainwater.'),
          mc('The Haber process makes ____.', 'ammonia', ['sulphuric acid', 'steel', 'ethene'], 'Nitrogen and hydrogen combine.'),
        ]),
      ]),
    ],
  },
};
