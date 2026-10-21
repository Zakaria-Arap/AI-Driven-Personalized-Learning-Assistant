const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'GEO', name: 'Geography', pathway: 'social',
  grades: {
    10: [
      strand('Physical Geography', [
        topic('weather', 'Weather and climate', 'Describe elements of weather and the instruments used.', [], [
          mc('Which instrument measures rainfall?', 'Rain gauge', ['Barometer', 'Anemometer', 'Hygrometer'], 'A rain gauge collects rainwater.'),
          mc('Atmospheric pressure is measured using a ____.', 'barometer', ['thermometer', 'wind vane', 'sunshine recorder'], 'Pressure is measured in millibars or hPa.'),
          mc('The difference between weather and climate is that climate is ____.', 'the average weather over a long period', ['today\'s temperature', 'only about rain', 'measured at night'], 'Climate is usually averaged over 30 years.'),
        ]),
        topic('rocks', 'Rocks and minerals', 'Classify rocks and explain their formation.', [], [
          mc('Rocks formed from cooled magma are ____.', 'igneous', ['sedimentary', 'metamorphic', 'organic'], 'Granite and basalt are igneous.'),
          mc('Limestone is an example of a ____ rock.', 'sedimentary', ['igneous', 'metamorphic', 'volcanic'], 'Formed from deposited layers.'),
          mc('Marble is formed when limestone is changed by ____.', 'heat and pressure', ['wind only', 'rainfall', 'ocean tides'], 'This produces metamorphic rock.'),
        ]),
      ]),
      strand('Map Work', [
        topic('maps', 'Map reading and scale', 'Use scale, direction and grid references.', [], [
          num('On a map of scale 1 : 50 000, 4 cm represents how many kilometres on the ground?', 2, '4 x 50 000 = 200 000 cm = 2 km'),
          mc('Lines joining places of equal height on a map are ____.', 'contours', ['isobars', 'isotherms', 'meridians'], 'Contour lines show relief.'),
          mc('The direction opposite to north-east is ____.', 'south-west', ['north-west', 'south-east', 'west'], 'Opposite directions are 180 degrees apart.'),
        ]),
        topic('earth', 'The Earth and the solar system', 'Explain rotation and revolution.', [], [
          mc('The Earth\'s rotation on its axis causes ____.', 'day and night', ['seasons', 'tides only', 'earthquakes'], 'One rotation takes about 24 hours.'),
          mc('The Earth takes about ____ to revolve around the Sun.', '365 days', ['24 hours', '30 days', '12 hours'], 'One year.'),
          mc('The imaginary line at 0 degrees latitude is the ____.', 'Equator', ['Prime Meridian', 'Tropic of Cancer', 'Arctic Circle'], 'The Equator divides the Earth into hemispheres.'),
        ]),
      ]),
    ],
    11: [
      strand('Human Geography', [
        topic('popn', 'Population', 'Interpret population data.', [], [
          num('A county has 1 000 000 people living in 500 square kilometres. What is its population density per square kilometre?', 2000, 'density = people / area = 1 000 000 / 500 = 2000'),
          mc('The birth rate is the number of births per ____ people per year.', '1000', ['100', '10', '1 000 000'], 'Expressed per thousand.'),
          mc('A population pyramid with a wide base shows ____.', 'a high birth rate', ['a high death rate only', 'an ageing population', 'no growth'], 'Many young people.'),
        ]),
        topic('agri', 'Agriculture', 'Describe farming systems in Kenya.', [], [
          mc('Which is a cash crop in Kenya?', 'Tea', ['Maize for home use only', 'Wild fruits', 'Grass'], 'Tea is grown for sale and export.'),
          mc('Rearing animals on natural pasture over wide areas is ____.', 'pastoralism', ['horticulture', 'shifting cultivation', 'plantation farming'], 'Common in arid and semi-arid areas.'),
          mc('Growing flowers, fruits and vegetables is called ____.', 'horticulture', ['pastoralism', 'forestry', 'fishing'], 'A major export earner.'),
        ]),
      ]),
      strand('Environment', [
        topic('climchg', 'Climate change', 'Explain causes and effects of climate change.', [], [
          mc('Which gas is the main cause of global warming?', 'Carbon dioxide', ['Oxygen', 'Nitrogen', 'Argon'], 'It traps heat in the atmosphere.'),
          mc('A way to reduce climate change is to ____.', 'plant trees', ['burn more fuel', 'clear forests', 'increase pollution'], 'Trees absorb carbon dioxide.'),
          mc('Melting polar ice leads to ____.', 'rising sea levels', ['falling sea levels', 'colder oceans', 'less rainfall everywhere'], 'More water enters the oceans.'),
        ]),
        topic('mining', 'Mining and energy', 'Describe minerals and energy sources in Kenya.', [], [
          mc('Geothermal power in Kenya is produced mainly at ____.', 'Olkaria', ['Mombasa', 'Kisumu', 'Nyeri'], 'Olkaria is near Naivasha.'),
          mc('Soda ash in Kenya is mined at Lake ____.', 'Magadi', ['Victoria', 'Turkana', 'Naivasha'], 'Magadi is in the Rift Valley.'),
          mc('Which is a renewable source of energy?', 'Solar', ['Coal', 'Petroleum', 'Natural gas'], 'It is replaced naturally.'),
        ]),
      ]),
    ],
    12: [
      strand('Economic Geography', [
        topic('indus', 'Industrialisation', 'Explain factors influencing industrial location.', [], [
          mc('A factor that influences industrial location is ____.', 'availability of raw materials', ['the colour of buildings', 'the local football team', 'rain only'], 'Also markets, power and transport.'),
          mc('Turning raw materials into finished goods is ____.', 'manufacturing', ['farming', 'mining', 'fishing'], 'Manufacturing adds value.'),
          mc('Jua kali refers to ____.', 'informal small-scale industries', ['large factories', 'farming', 'tourism'], 'A key part of Kenya\'s informal sector.'),
        ]),
        topic('transport', 'Transport and trade', 'Describe transport systems and trade.', [], [
          mc('The cheapest way to move bulky goods over long distances is usually by ____.', 'water or rail', ['air', 'bicycle', 'motorbike'], 'Large volumes cost less per unit.'),
          mc('Goods sold to other countries are ____.', 'exports', ['imports', 'subsidies', 'tariffs'], 'Exports earn foreign exchange.'),
          mc('A trade deficit occurs when ____.', 'imports are greater than exports', ['exports are greater than imports', 'they are equal', 'there is no trade'], 'The country spends more than it earns.'),
        ]),
      ]),
      strand('Environmental Management', [
        topic('envman', 'Environmental management', 'Explain conservation and sustainable use.', [], [
          mc('Sustainable development meets present needs without ____.', 'harming future generations', ['using any resources', 'building roads', 'trading'], 'It protects resources for the future.'),
          mc('Planting trees on bare land is called ____.', 'afforestation', ['deforestation', 'desertification', 'erosion'], 'Reforestation restores a cleared forest.'),
          mc('Soil erosion can be reduced by ____.', 'terracing', ['overgrazing', 'burning', 'ploughing downhill'], 'Terraces slow water down.'),
        ]),
        topic('gis', 'Regional integration and GIS', 'Describe regional blocs and geographic information systems.', [], [
          mc('GIS stands for ____.', 'Geographic Information System', ['General Information Service', 'Global Internet Standard', 'Ground Image Survey'], 'It captures, stores and maps spatial data.'),
          mc('Which is a regional trading bloc?', 'East African Community', ['FIFA', 'Red Cross', 'UNESCO'], 'EAC promotes trade among members.'),
          mc('Satellite images used to study the Earth form part of ____.', 'remote sensing', ['surveying by chain', 'oral history', 'cartoon mapping'], 'Remote sensing gathers data from a distance.'),
        ]),
      ]),
    ],
  },
};
