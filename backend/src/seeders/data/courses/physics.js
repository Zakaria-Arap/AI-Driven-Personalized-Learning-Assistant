const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'PHY', name: 'Physics', pathway: 'stem',
  grades: {
    10: [
      strand('Mechanics', [
        topic('meas', 'Measurement and density', 'Use SI units and calculate density.', [], [
          num('Convert 2.5 km to metres.', 2500, '1 km = 1000 m\n2.5 x 1000 = 2500'),
          num('A block has mass 200 g and volume 50 cm3. Find its density in g/cm3.', 4, 'density = mass / volume = 200 / 50 = 4'),
          mc('The SI unit of mass is the ____.', 'kilogram', ['gram', 'newton', 'litre'], 'The kilogram is the base unit of mass.'),
        ]),
        topic('force', 'Forces and Newton\'s laws', 'Apply F = ma and weight = mg.', [], [
          num('A 5 kg object accelerates at 2 m/s2. Find the force in newtons.', 10, 'F = ma = 5 x 2 = 10 N'),
          num('Find the weight of a 60 kg learner. (g = 10 N/kg)', 600, 'W = mg = 60 x 10 = 600 N'),
          mc('Newton\'s first law says an object stays at rest or in uniform motion unless ____.', 'a resultant force acts on it', ['it is heavy', 'it is hot', 'it is in a vacuum'], 'No resultant force means no change in motion.'),
        ]),
        topic('work', 'Work, energy and power', 'Calculate work, kinetic energy and power.', ['force'], [
          num('A force of 20 N moves an object 5 m. Find the work done in joules.', 100, 'W = Fd = 20 x 5 = 100 J'),
          num('Find the kinetic energy of a 2 kg object moving at 3 m/s.', 9, 'KE = 1/2 m v^2 = 0.5 x 2 x 9 = 9 J'),
          num('A machine does 600 J of work in 20 s. Find its power in watts.', 30, 'P = W / t = 600 / 20 = 30 W'),
        ]),
      ]),
      strand('Waves and Light', [
        topic('wave', 'Waves and reflection', 'Use v = f x wavelength and the law of reflection.', [], [
          num('A wave has frequency 50 Hz and wavelength 4 m. Find its speed in m/s.', 200, 'v = f x wavelength = 50 x 4 = 200'),
          num('A ray hits a plane mirror at an angle of incidence of 35 degrees. What is the angle of reflection?', 35, 'The angle of reflection equals the angle of incidence.'),
          mc('Sound waves are ____.', 'longitudinal', ['transverse', 'electromagnetic', 'visible'], 'Particles vibrate along the direction of travel.'),
        ]),
      ]),
    ],
    11: [
      strand('Electricity', [
        topic('elec', 'Current electricity', 'Apply Ohm\'s law and electrical power.', [], [
          num('A 12 V supply is connected across a 4 ohm resistor. Find the current in amperes.', 3, 'I = V / R = 12 / 4 = 3 A'),
          num('Two resistors of 3 ohm and 5 ohm are in series. Find the total resistance in ohms.', 8, 'Series resistances add: 3 + 5 = 8'),
          num('A kettle uses 2 A at 230 V. Find its power in watts.', 460, 'P = VI = 230 x 2 = 460 W'),
        ]),
        topic('mag', 'Magnetism and electromagnetism', 'Describe magnetic fields and electromagnets.', [], [
          mc('Magnetic field lines point from ____.', 'north pole to south pole', ['south to north', 'east to west', 'inside to outside only'], 'Outside a magnet field lines go from N to S.'),
          mc('A current-carrying wire in a magnetic field experiences ____.', 'a force', ['no effect', 'a decrease in mass', 'cooling'], 'This is the motor effect.'),
          mc('The strength of an electromagnet can be increased by ____.', 'adding more turns of wire', ['using a thinner nail', 'removing the core', 'reducing current'], 'More turns or more current give a stronger field.'),
        ]),
      ]),
      strand('Thermal Physics and Pressure', [
        topic('heat', 'Heat and thermal energy', 'Use Q = mc x temperature change.', [], [
          num('How much heat is needed to raise 2 kg of water by 10 C? (c = 4200 J/kg C)', 84000, 'Q = mc dT = 2 x 4200 x 10 = 84000 J'),
          mc('Heat transfer in fluids mainly occurs by ____.', 'convection', ['conduction', 'radiation only', 'friction'], 'Warm fluid rises, cool fluid sinks.'),
          mc('Which colour surface is the best absorber of radiation?', 'Dull black', ['Shiny white', 'Shiny silver', 'Light yellow'], 'Dull black surfaces absorb and emit best.'),
        ]),
        topic('press', 'Pressure and moments', 'Calculate pressure and moments.', [], [
          num('A force of 500 N acts on an area of 2 m2. Find the pressure in pascals.', 250, 'P = F / A = 500 / 2 = 250 Pa'),
          num('A 20 N force acts 0.5 m from a pivot. Find the moment in N m.', 10, 'Moment = force x distance = 20 x 0.5 = 10'),
          mc('Pressure in a liquid increases with ____.', 'depth', ['width of the container', 'colour', 'surface area only'], 'P = density x g x depth.'),
        ]),
      ]),
    ],
    12: [
      strand('Modern Physics', [
        topic('radio', 'Radioactivity', 'Describe radiation types and half-life.', [], [
          num('A sample has 80 g of a radioactive isotope with half-life 2 days. How many grams remain after 6 days?', 10, '6 days = 3 half-lives\n80 to 40 to 20 to 10'),
          mc('An alpha particle is ____.', 'a helium nucleus', ['an electron', 'a photon', 'a neutron'], 'It has 2 protons and 2 neutrons.'),
          mc('Which radiation is the most penetrating?', 'Gamma', ['Alpha', 'Beta', 'Visible light'], 'Gamma needs thick lead or concrete to be stopped.'),
        ]),
        topic('quantum', 'Photons and the photoelectric effect', 'Explain the particle nature of light.', [], [
          mc('The photoelectric effect shows that light behaves as ____.', 'particles (photons)', ['sound waves only', 'a liquid', 'a magnetic field'], 'Energy comes in packets called photons.'),
          mc('The energy of a photon depends on its ____.', 'frequency', ['colour of the metal only', 'speed in glass', 'brightness only'], 'E = h f.'),
          mc('Electrons are emitted from a metal only if the light frequency is above the ____.', 'threshold frequency', ['wavelength limit of air', 'boiling point', 'critical angle'], 'Below it, no electrons are emitted whatever the intensity.', 2),
        ]),
      ]),
      strand('Induction and Optics', [
        topic('induct', 'Electromagnetic induction and transformers', 'Use the transformer equation.', [], [
          num('A transformer has 100 primary turns, 200 secondary turns and a 12 V primary voltage. Find the secondary voltage.', 24, 'Vs / Vp = Ns / Np\nVs = 12 x 200 / 100 = 24 V'),
          mc('A transformer works only with ____.', 'alternating current', ['direct current', 'static charge', 'no current'], 'A changing field is needed to induce a voltage.'),
          mc('A step-up transformer has ____.', 'more turns on the secondary coil', ['more turns on the primary coil', 'equal turns', 'no core'], 'More secondary turns give a higher voltage.'),
        ]),
        topic('refract', 'Refraction and lenses', 'Calculate refractive index and describe lenses.', [], [
          num('Light has sin(i) = 0.75 and sin(r) = 0.5 on entering glass. Find the refractive index.', 1.5, 'n = sin i / sin r = 0.75 / 0.5 = 1.5', 0.01),
          mc('A converging lens is ____.', 'thicker at the centre', ['thinner at the centre', 'flat', 'always concave'], 'It brings parallel rays to a focus.'),
          mc('Total internal reflection occurs when the angle of incidence is ____.', 'greater than the critical angle', ['zero', 'smaller than the critical angle', 'equal to the angle of reflection'], 'Light must travel from a denser to a less dense medium.', 2),
        ]),
      ]),
    ],
  },
};
