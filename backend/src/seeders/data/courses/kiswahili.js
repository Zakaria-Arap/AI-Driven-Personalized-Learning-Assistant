const { mc, topic, strand } = require('./_h');
module.exports = {
  code: 'KIS', name: 'Kiswahili', pathway: 'compulsory',
  grades: {
    10: [
      strand('Sarufi na Matumizi ya Lugha', [
        topic('ngeli', 'Ngeli za nomino', 'Kutumia ngeli za nomino kwa usahihi katika sentensi.', [], [
          mc('Chagua sentensi sahihi.', 'Kitabu kimefika.', ['Kitabu amefika.', 'Kitabu imefika.', 'Kitabu wamefika.'], 'Kitabu kiko katika ngeli ya KI-VI, hivyo kiambishi ni ki-.'),
          mc('Wingi wa "mtoto" ni ____.', 'watoto', ['vitoto', 'mitoto', 'matoto'], 'Ngeli ya A-WA: mtoto, watoto.'),
          mc('Neno "mti" liko katika ngeli ya ____.', 'U-I', ['A-WA', 'KI-VI', 'LI-YA'], 'Mti (miti) ni ngeli ya U-I.'),
        ]),
        topic('nyakati', 'Nyakati na hali', 'Kutumia viambishi vya nyakati kwa usahihi.', [], [
          mc('"Nitasoma" ni kauli ya wakati gani?', 'Wakati ujao', ['Wakati uliopita', 'Wakati uliopo', 'Wakati timilifu'], 'Kiambishi -ta- kinaonyesha wakati ujao.'),
          mc('Kiambishi cha wakati uliopita ni ____.', '-li-', ['-na-', '-ta-', '-me-'], '-li- huonyesha wakati uliopita: alisoma.'),
          mc('"Amekula" ina maana ya ____.', 'ametimiza kula (hali timilifu)', ['atakula', 'anakula sasa hivi', 'hajala'], '-me- inaonyesha hali timilifu.'),
        ]),
      ]),
      strand('Fasihi', [
        topic('methali', 'Methali na nahau', 'Kueleza maana ya methali na nahau.', [], [
          mc('Methali "Haraka haraka haina baraka" inafundisha nini?', 'Kufanya mambo kwa makini', ['Kukimbia sana', 'Kuwa mvivu', 'Kutokuwa na haraka kamwe'], 'Kuharakisha kupita kiasi husababisha makosa.'),
          mc('Nahau "kupiga moyo konde" maana yake ni ____.', 'kujipa moyo', ['kuumwa moyo', 'kupiga ngoma', 'kuwa na hasira'], 'Kupiga moyo konde ni kujipa ujasiri.'),
          mc('Methali kamili ni "Mchelea mwana kulia ____."', 'hulia yeye', ['hucheka sana', 'hukimbia', 'hulala'], 'Mchelea mwana kulia hulia yeye.', 2),
        ]),
        topic('insha', 'Uandishi wa insha', 'Kuandika insha ya methali na ya kubuni.', [], [
          mc('Sehemu ya kwanza ya insha inaitwa ____.', 'utangulizi', ['hitimisho', 'kiini', 'kichwa pekee'], 'Insha ina utangulizi, kiini na hitimisho.'),
          mc('Barua rasmi huanza na ____.', 'anwani ya mwandishi', ['salamu ya "Mambo?"', 'mwisho', 'sahihi'], 'Anwani ya mwandishi huandikwa kulia juu.'),
          mc('Kitu kinachoonyesha mwisho wa insha ni ____.', 'hitimisho', ['utangulizi', 'kichwa', 'anwani'], 'Hitimisho hufunga insha.'),
        ]),
      ]),
    ],
    11: [
      strand('Sarufi na Matumizi ya Lugha', [
        topic('sentensi', 'Aina za sentensi', 'Kutambua sentensi sahili, ambatano na changamano.', [], [
          mc('"Juma anacheza na Ali anasoma." ni sentensi ya aina gani?', 'Ambatano', ['Sahili', 'Changamano', 'Ya swali'], 'Sentensi mbili huru zimeunganishwa: ni ambatano.'),
          mc('Sentensi changamano ina ____.', 'kishazi huru na kishazi tegemezi', ['kitenzi kimoja tu', 'majina pekee', 'viunganishi viwili tu'], 'Changamano = kishazi huru + tegemezi.'),
          mc('"Mwanafunzi aliyefaulu amepewa zawadi." Kishazi tegemezi ni ____.', 'aliyefaulu', ['amepewa zawadi', 'mwanafunzi', 'zawadi'], '"Aliyefaulu" hutegemea nomino mwanafunzi.', 2),
        ]),
        topic('tungo', 'Kauli za vitenzi', 'Kutumia kauli za kutenda, kutendwa, kutendea na kutendeka.', [], [
          mc('Kauli ya kutendwa ya "pika" ni ____.', 'pikwa', ['pikia', 'pikika', 'pikana'], 'Kutendwa hutumia -w-: pikwa.'),
          mc('"Anamwandikia mama barua." Kauli iliyotumika ni ____.', 'kutendea', ['kutendwa', 'kutendeka', 'kutendana'], '-i- inaonyesha kutendea (kwa niaba/kwa ajili ya).'),
          mc('Kauli ya kutendeka ya "vunja" ni ____.', 'vunjika', ['vunjwa', 'vunjia', 'vunjiana'], 'Kutendeka hutumia -ik-: vunjika.'),
        ]),
      ]),
      strand('Fasihi', [
        topic('simulizi', 'Fasihi simulizi', 'Kutambua tanzu za fasihi simulizi.', [], [
          mc('Ipi ni tanzu ya fasihi simulizi?', 'Hadithi', ['Riwaya', 'Tamthilia iliyoandikwa', 'Diwani'], 'Hadithi, methali, vitendawili na nyimbo ni fasihi simulizi.'),
          mc('Kitendawili ni ____.', 'maneno ya mafumbo yanayohitaji kuteguliwa', ['wimbo wa harusi', 'hadithi ndefu', 'shairi'], 'Hutegwa na kuteguliwa.'),
          mc('Wahusika wanyama wanaofundisha maadili hupatikana katika ____.', 'ngano', ['vitendawili', 'methali', 'mashairi'], 'Ngano mara nyingi hutumia wanyama.'),
        ]),
        topic('shairi', 'Uchambuzi wa shairi', 'Kuchambua muundo na maudhui ya shairi.', [], [
          mc('Mstari mmoja wa shairi huitwa ____.', 'mshororo', ['ubeti', 'kina', 'vina'], 'Mshororo = mstari; ubeti = kikundi cha mishororo.'),
          mc('Sehemu ya mwisho ya mshororo yenye sauti inayofanana huitwa ____.', 'kina', ['mizani', 'bahari', 'kituo'], 'Kina ni mlio wa mwisho wa mshororo.'),
          mc('Idadi ya silabi katika mshororo huitwa ____.', 'mizani', ['kina', 'ubeti', 'kibwagizo'], 'Mizani = silabi.', 2),
        ]),
      ]),
    ],
    12: [
      strand('Sarufi na Matumizi ya Lugha', [
        topic('semi', 'Msamiati wa taaluma na semi', 'Kutumia misemo na istilahi za taaluma.', [], [
          mc('Msemo "kuvunja ungo" una maana ya ____.', 'kubalehe (msichana)', ['kuvunja chombo', 'kuolewa', 'kufa'], 'Kuvunja ungo ni kufikia ubalehe.'),
          mc('Kisawe cha neno "shule" ni ____.', 'madrasa/skuli', ['kiwanda', 'sokoni', 'hospitali'], 'Skuli ni kisawe cha shule.'),
          mc('Kinyume cha "ukarimu" ni ____.', 'ubahili', ['uchaji', 'utamu', 'ushujaa'], 'Ubahili ni ukosefu wa ukarimu.'),
        ]),
        topic('upatanisho', 'Upatanisho wa kisarufi', 'Kutumia upatanisho wa kisarufi.', [], [
          mc('Chagua sentensi sahihi.', 'Watoto wazuri wanacheza.', ['Watoto nzuri wanacheza.', 'Watoto mzuri anacheza.', 'Watoto kizuri wanacheza.'], 'Kivumishi kinapatana na nomino: wa- kwa ngeli ya A-WA.'),
          mc('Chagua sentensi sahihi.', 'Miti mirefu imeanguka.', ['Miti mrefu imeanguka.', 'Miti mirefu ameanguka.', 'Miti virefu imeanguka.'], 'Miti ni ngeli ya U-I (wingi): mi- na i-.'),
          mc('Chagua sentensi sahihi.', 'Visu vikali vimepotea.', ['Visu mikali vimepotea.', 'Visu vikali imepotea.', 'Visu kali wamepotea.'], 'Visu = KI-VI wingi: vi-.'),
        ]),
      ]),
      strand('Fasihi', [
        topic('riwaya', 'Uchambuzi wa riwaya', 'Kuchambua dhamira na wahusika katika riwaya.', [], [
          mc('Ujumbe mkuu unaofundishwa na kazi ya fasihi huitwa ____.', 'dhamira', ['mtindo', 'wahusika', 'mandhari'], 'Dhamira ni ujumbe/lengo la mwandishi.'),
          mc('Mahali na wakati ambamo tukio hutokea ni ____.', 'mandhari', ['dhamira', 'mtindo', 'kina'], 'Mandhari = mazingira ya kisa.'),
          mc('Mtu au kiumbe kinachotenda katika kazi ya fasihi ni ____.', 'mhusika', ['mtunzi', 'msomaji', 'mhakiki'], 'Mhusika hutenda katika hadithi.'),
        ]),
        topic('tamthilia', 'Tamthilia na ushairi', 'Kutambua vipengele vya tamthilia.', [], [
          mc('Sehemu kuu ya tamthilia inaitwa ____.', 'onyesho/tendo', ['kina', 'mizani', 'ubeti'], 'Tamthilia hugawanywa katika matendo na maonyesho.'),
          mc('Maneno anayosema mhusika peke yake jukwaani huitwa ____.', 'monolojia/kujisemea', ['mazungumzo', 'wimbo', 'tashbihi'], 'Mhusika hujisemea peke yake.'),
          mc('Tashbihi ni ____.', 'ulinganisho wa vitu kwa kutumia "kama" au "mithili ya"', ['kutia chuku', 'kuiga sauti', 'kuuliza swali'], 'Mfano: Mwenye kasi kama ndege.'),
        ]),
      ]),
    ],
  },
};
