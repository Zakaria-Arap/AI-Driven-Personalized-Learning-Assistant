const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'BIO', name: 'Biology', pathway: 'stem',
  grades: {
    10: [
      strand('Cell Biology', [
        topic('cell', 'Cell structure and organisation', 'Describe cell organelles and their functions.', [], [
          mc('Which organelle is the site of aerobic respiration?', 'Mitochondrion', ['Ribosome', 'Nucleus', 'Chloroplast'], 'Mitochondria release energy from glucose using oxygen.'),
          mc('Which structure is found in plant cells but not in animal cells?', 'Cell wall', ['Cell membrane', 'Cytoplasm', 'Ribosome'], 'Plant cells have a cellulose cell wall.'),
          mc('The control centre of the cell is the ____.', 'nucleus', ['vacuole', 'lysosome', 'Golgi body'], 'The nucleus contains DNA and controls cell activities.'),
        ]),
        topic('division', 'Cell division', 'Distinguish mitosis from meiosis.', ['cell'], [
          mc('Mitosis produces ____.', 'two identical diploid cells', ['four haploid cells', 'two haploid cells', 'one large cell'], 'Mitosis gives identical daughter cells for growth and repair.'),
          mc('Meiosis takes place in the ____.', 'reproductive organs', ['skin', 'leaf', 'bone'], 'Meiosis forms gametes.'),
          mc('The number of chromosomes in a human body cell is ____.', '46', ['23', '44', '48'], 'Humans have 23 pairs: 46 chromosomes.', 2),
        ]),
      ]),
      strand('Nutrition and Transport', [
        topic('photo', 'Photosynthesis', 'Explain how plants make food and the conditions required.', [], [
          mc('Which gas is taken in by plants during photosynthesis?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Hydrogen'], 'Plants take in CO2 and release oxygen.'),
          mc('Where does photosynthesis mainly occur in a leaf?', 'Palisade mesophyll cells', ['Epidermis', 'Xylem', 'Guard cells only'], 'Palisade cells have many chloroplasts.'),
          mc('Which pigment traps light energy for photosynthesis?', 'Chlorophyll', ['Haemoglobin', 'Melanin', 'Keratin'], 'Chlorophyll absorbs light.'),
        ]),
        topic('classif', 'Classification', 'Classify living things into groups.', [], [
          mc('The correct order from largest to smallest group is ____.', 'Kingdom, Phylum, Class, Order, Family, Genus, Species', ['Species, Genus, Family, Order, Class, Phylum, Kingdom', 'Kingdom, Class, Phylum, Order, Genus, Family, Species', 'Phylum, Kingdom, Class, Family, Order, Species, Genus'], 'Mnemonic: King Philip Came Over For Good Soup.'),
          mc('Which group of animals has an exoskeleton and jointed legs?', 'Arthropods', ['Mammals', 'Reptiles', 'Amphibians'], 'Insects, spiders and crabs are arthropods.'),
          mc('Organisms that make their own food are called ____.', 'autotrophs', ['heterotrophs', 'parasites', 'saprophytes'], 'Autotrophs photosynthesise or chemosynthesise.'),
        ]),
      ]),
    ],
    11: [
      strand('Energy and Gas Exchange', [
        topic('resp', 'Respiration and gaseous exchange', 'Explain aerobic and anaerobic respiration.', [], [
          mc('The products of aerobic respiration are ____.', 'carbon dioxide and water', ['lactic acid only', 'oxygen and glucose', 'ethanol and oxygen'], 'Glucose + oxygen gives CO2 + water + energy.'),
          mc('Anaerobic respiration in yeast produces ____.', 'ethanol and carbon dioxide', ['lactic acid', 'water only', 'oxygen'], 'Alcoholic fermentation.'),
          mc('Gaseous exchange in the alveoli takes place by ____.', 'diffusion', ['osmosis', 'active transport', 'filtration'], 'Gases move down a concentration gradient.'),
        ]),
        topic('repro', 'Reproduction', 'Describe sexual reproduction in plants and humans.', [], [
          mc('Transfer of pollen from anther to stigma is ____.', 'pollination', ['fertilisation', 'germination', 'dispersal'], 'Pollination precedes fertilisation.'),
          mc('Where does fertilisation occur in humans?', 'Fallopian tube (oviduct)', ['Uterus', 'Vagina', 'Ovary'], 'Sperm meets the egg in the oviduct.'),
          mc('The structure that nourishes the foetus is the ____.', 'placenta', ['amnion', 'cervix', 'ovary'], 'The placenta exchanges nutrients and wastes.'),
        ]),
      ]),
      strand('Genetics and Ecology', [
        topic('gen', 'Genetics and inheritance', 'Predict inheritance using monohybrid crosses.', [], [
          mc('A cross between Tt and Tt gives what ratio of tall (T dominant) to short?', '3 : 1', ['1 : 1', '1 : 3', '4 : 0'], 'TT, Tt, Tt are tall; tt is short.'),
          num('In a cross between two heterozygous parents (Aa x Aa), what percentage of offspring are homozygous recessive (aa)?', 25, 'One in four offspring is aa = 25%.'),
          mc('An organism\'s genetic makeup is its ____.', 'genotype', ['phenotype', 'allele', 'gamete'], 'Phenotype is what is observed.'),
        ]),
        topic('eco', 'Ecology', 'Describe food chains, energy flow and nutrient cycles.', [], [
          mc('In a food chain, producers are ____.', 'green plants', ['herbivores', 'decomposers', 'carnivores'], 'Plants make food by photosynthesis.'),
          mc('About how much energy passes to the next trophic level?', '10%', ['90%', '50%', '100%'], 'The 10 percent rule: most is lost as heat.'),
          mc('Organisms that break down dead matter are ____.', 'decomposers', ['producers', 'consumers', 'predators'], 'Bacteria and fungi recycle nutrients.'),
        ]),
      ]),
    ],
    12: [
      strand('Evolution and Control', [
        topic('evol', 'Evolution', 'Explain natural selection and evidence for evolution.', [], [
          mc('Natural selection was proposed by ____.', 'Charles Darwin', ['Gregor Mendel', 'Louis Pasteur', 'Robert Hooke'], 'Darwin and Wallace proposed natural selection.'),
          mc('Fossils provide evidence of evolution because they show ____.', 'changes in organisms over time', ['only plant life', 'recent animals', 'the sun\'s age'], 'Fossil sequences show gradual change.'),
          mc('Organisms with favourable variations are more likely to ____.', 'survive and reproduce', ['die early', 'migrate', 'stop growing'], 'They pass advantageous alleles on.'),
        ]),
        topic('homeo', 'Homeostasis and hormones', 'Describe how the body keeps a stable internal environment.', [], [
          mc('The hormone that lowers blood glucose is ____.', 'insulin', ['glucagon', 'adrenaline', 'thyroxine'], 'Insulin is released by the pancreas.'),
          mc('The part of the brain that acts as the body\'s temperature control centre is the ____.', 'hypothalamus', ['pancreas', 'liver', 'kidney'], 'The hypothalamus monitors blood temperature.'),
          mc('Sweating helps cool the body by ____.', 'evaporation of water', ['condensation', 'sinking blood', 'shivering'], 'Evaporation takes heat from the skin.'),
        ]),
      ]),
      strand('Applied Biology', [
        topic('biotech', 'Biotechnology', 'Describe applications of biotechnology.', [], [
          mc('Which organism is used to make bread rise?', 'Yeast', ['Bacteria that cause cholera', 'Algae', 'Virus'], 'Yeast respires and produces CO2.'),
          mc('Inserting a gene from one organism into another is ____.', 'genetic engineering', ['cloning only', 'fermentation', 'pasteurisation'], 'It makes transgenic organisms.'),
          mc('Pasteurisation of milk is done to ____.', 'kill harmful microorganisms', ['add fat', 'make it sweeter', 'increase protein'], 'Heating kills pathogens.'),
        ]),
        topic('excret', 'Excretion', 'Explain how the kidney removes wastes.', [], [
          mc('The functional unit of the kidney is the ____.', 'nephron', ['neuron', 'alveolus', 'villus'], 'Nephrons filter blood.'),
          mc('Urea is formed in the ____.', 'liver', ['kidney', 'bladder', 'heart'], 'The liver deaminates amino acids to urea.'),
          mc('Which hormone controls water reabsorption in the kidney?', 'ADH', ['Insulin', 'Oestrogen', 'Thyroxine'], 'ADH makes the collecting duct more permeable.'),
        ]),
      ]),
    ],
  },
};
