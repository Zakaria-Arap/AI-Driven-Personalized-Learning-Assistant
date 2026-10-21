const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'CRE', name: 'Christian Religious Education', pathway: 'social',
  grades: {
    10: [
      strand('The Bible and Creation', [
        topic('bible', 'Introduction to the Bible', 'Describe the structure and use of the Bible.', [], [
          num('How many books are in the Protestant Bible?', 66, 'The Old Testament has 39 books and the New Testament has 27.'),
          mc('The first book of the Bible is ____.', 'Genesis', ['Exodus', 'Matthew', 'Psalms'], 'Genesis means beginnings.'),
          mc('The Gospels are found in the ____.', 'New Testament', ['Old Testament', 'Apocrypha only', 'Law of Moses'], 'Matthew, Mark, Luke and John.'),
        ]),
        topic('creation', 'Creation and the fall', 'Explain the biblical account of creation.', [], [
          mc('According to Genesis 1, God created humans on the ____ day.', 'sixth', ['first', 'third', 'seventh'], 'On the sixth day.'),
          mc('Humans were created in the ____ of God.', 'image', ['name', 'shadow', 'voice'], 'Genesis 1:27.'),
          mc('The fall of humanity was caused by ____.', 'disobedience to God', ['a flood', 'war', 'lack of food'], 'Adam and Eve ate the forbidden fruit.'),
        ]),
      ]),
      strand('Faith and Morality', [
        topic('abraham', 'Abraham and faith', 'Describe Abraham\'s faith and covenant.', [], [
          mc('God told Abram to leave his country and go to ____.', 'a land God would show him', ['Egypt', 'Rome', 'Babylon'], 'Genesis 12.'),
          mc('The sign of the covenant with Abraham was ____.', 'circumcision', ['baptism', 'the rainbow', 'the Sabbath'], 'Genesis 17.'),
          mc('Abraham is called the father of ____.', 'faith', ['kings', 'prophets', 'judges'], 'He trusted God.'),
        ]),
        topic('commands', 'The Ten Commandments', 'Explain the Ten Commandments and their relevance.', [], [
          num('How many commandments did God give Moses on Mount Sinai?', 10, 'Exodus 20.'),
          mc('Which commandment is about honouring parents?', 'The fifth', ['The first', 'The eighth', 'The tenth'], '"Honour your father and your mother."'),
          mc('"You shall not steal" teaches ____.', 'respect for other people\'s property', ['kindness to animals', 'prayer times', 'church attendance'], 'It protects property.'),
        ]),
      ]),
    ],
    11: [
      strand('Deliverance and Prophets', [
        topic('exodus', 'The Exodus and the covenant at Sinai', 'Describe the liberation from Egypt.', [], [
          mc('God called Moses at the ____.', 'burning bush', ['Red Sea', 'Mount Carmel', 'Jordan River'], 'Exodus 3.'),
          mc('The Passover commemorates ____.', 'the angel of death passing over Israelite homes', ['the creation of the world', 'the birth of Jesus', 'the fall of Jericho'], 'Exodus 12.'),
          mc('The Israelites crossed the ____.', 'Red Sea', ['Dead Sea', 'Sea of Galilee', 'Mediterranean'], 'God parted the sea.'),
        ]),
        topic('elijah', 'The prophet Elijah', 'Explain the ministry of Elijah.', [], [
          mc('Elijah challenged the prophets of Baal on Mount ____.', 'Carmel', ['Sinai', 'Zion', 'Olives'], '1 Kings 18.'),
          mc('The contest on Mount Carmel showed that ____.', 'the LORD is the true God', ['Baal is powerful', 'rain comes from kings', 'fire is useless'], 'God sent fire.'),
          mc('Elijah fled from ____.', 'Queen Jezebel', ['King David', 'Pharaoh', 'Herod'], '1 Kings 19.'),
        ]),
      ]),
      strand('Jesus Christ and the Family', [
        topic('jesus', 'The ministry of Jesus', 'Describe the baptism, temptation and miracles of Jesus.', [], [
          mc('Jesus was baptised by ____.', 'John the Baptist', ['Peter', 'Paul', 'Moses'], 'In the River Jordan.'),
          mc('Jesus was tempted in the ____.', 'wilderness', ['temple', 'garden of Eden', 'upper room'], 'He fasted for forty days.'),
          num('How many disciples did Jesus choose as his closest group?', 12, 'The Twelve Apostles.'),
        ]),
        topic('marriage', 'Christian marriage and family', 'Explain Christian teaching on marriage.', [], [
          mc('Christian marriage is meant to be ____.', 'a lifelong union between a man and a woman', ['temporary', 'only for the rich', 'a business contract'], 'Based on Genesis 2 and Matthew 19.'),
          mc('Parents are expected to ____.', 'bring up children in the faith', ['ignore their children', 'send them away', 'avoid discipline'], 'Proverbs 22:6.'),
          mc('Faithfulness in marriage means ____.', 'being loyal to one\'s spouse', ['having many partners', 'ignoring promises', 'living apart'], 'Fidelity.'),
        ]),
      ]),
    ],
    12: [
      strand('The Early Church', [
        topic('pent', 'Pentecost and the early church', 'Describe events of Pentecost.', [], [
          mc('At Pentecost the disciples received ____.', 'the Holy Spirit', ['a new law', 'gold', 'Roman citizenship'], 'Acts 2.'),
          mc('The disciples began to ____.', 'speak in other languages', ['sleep', 'hide in Egypt', 'build a temple'], 'Visitors heard them in their own languages.'),
          mc('Who preached the sermon at Pentecost?', 'Peter', ['Judas', 'Thomas', 'Stephen'], 'About three thousand believed.'),
        ]),
        topic('paul', 'Paul\'s missionary journeys', 'Outline the work of the apostle Paul.', [], [
          mc('Paul was converted on the road to ____.', 'Damascus', ['Jerusalem', 'Rome', 'Athens'], 'Acts 9.'),
          mc('Paul\'s original name was ____.', 'Saul', ['Simon', 'Silas', 'Stephen'], 'He was a Pharisee.'),
          num('How many missionary journeys of Paul are usually described in Acts?', 3, 'Three journeys, then the voyage to Rome.'),
        ]),
      ]),
      strand('Christianity and Society', [
        topic('africa', 'Christianity in Africa and Kenya', 'Describe how Christianity spread in Africa.', [], [
          mc('The first Christian missionaries to East Africa in the 1800s included ____.', 'Johann Ludwig Krapf', ['Mahatma Gandhi', 'Napoleon', 'Julius Caesar'], 'He arrived at Mombasa in 1844.'),
          mc('Missionaries helped Kenyan communities by building ____.', 'schools and hospitals', ['palaces', 'airports only', 'casinos'], 'Education and health services.'),
          mc('African Independent Churches began partly because of ____.', 'a desire for African leadership and culture', ['a ban on prayer', 'lack of Bibles only', 'war'], 'They wanted ownership of their faith.', 2),
        ]),
        topic('issues', 'Contemporary social issues', 'Apply Christian teaching to issues like HIV/AIDS and drug abuse.', [], [
          mc('The Christian response to people living with HIV should be ____.', 'compassion and care', ['rejection', 'ridicule', 'silence'], 'Jesus showed compassion to the sick.'),
          mc('Substance abuse harms ____.', 'health and relationships', ['only money', 'nobody', 'only the police'], 'It damages the body and families.'),
          mc('Christian teaching on honesty is found in the commandment ____.', 'do not bear false witness', ['rest on the Sabbath', 'honour your parents', 'no other gods'], 'The ninth commandment.'),
        ]),
      ]),
    ],
  },
};
