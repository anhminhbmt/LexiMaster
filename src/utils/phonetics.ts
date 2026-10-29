/**
 * Complete IPA phonetic dictionary for all curriculum vocabulary items
 * plus an intelligent fallback generator for user-added custom words.
 */

export const IPA_DICTIONARY: Record<string, string> = {
  // UNIT 3: DAYS, DATES & SEASONS
  'monday': '/ˈmʌn.deɪ/',
  'tuesday': '/ˈtjuːz.deɪ/',
  'wednesday': '/ˈwenz.deɪ/',
  'thursday': '/ˈθɜːz.deɪ/',
  'friday': '/ˈfraɪ.deɪ/',
  'saturday': '/ˈsæt.ə.deɪ/',
  'sunday': '/ˈsʌn.deɪ/',
  'january': '/ˈdʒæn.ju.ə.ri/',
  'february': '/ˈfeb.ru.ə.ri/',
  'march': '/mɑːtʃ/',
  'april': '/ˈeɪ.prəl/',
  'may': '/meɪ/',
  'june': '/dʒuːn/',
  'july': '/dʒuˈlaɪ/',
  'august': '/ˈɔː.ɡəst/',
  'september': '/sepˈtem.bər/',
  'october': '/ɒkˈtəʊ.bər/',
  'november': '/nəʊˈvem.bər/',
  'december': '/dɪˈsem.bər/',
  'winter': '/ˈwɪn.tər/',
  'spring': '/sprɪŋ/',
  'autumn': '/ˈɔː.təm/',
  'summer': '/ˈsʌm.ər/',

  // UNIT 4: COUNTRIES
  'where are you from? / where do you come from?': '/weər ɑː juː frɒm/ • /weə duː juː kʌm frɒm/',
  'i come from...': '/aɪ kʌm frɒm.../',
  'the czech republic': '/ðə ˌtʃek rɪˈpʌb.lɪk/',
  'czech': '/tʃek/',
  'france': '/frɑːns/',
  'french': '/frentʃ/',
  'germany': '/ˈdʒɜː.mə.ni/',
  'german': '/ˈdʒɜː.mən/',
  'greece': '/ɡriːs/',
  'greek': '/ɡriːk/',
  'hungary': '/ˈhʌŋ.ɡər.i/',
  'hungarian': '/hʌŋˈɡeə.ri.ən/',
  'italy': '/ˈɪt.əl.i/',
  'italian': '/ɪˈtæl.jən/',
  'poland': '/ˈpəʊ.lənd/',
  'polish': '/ˈpəʊ.lɪʃ/',
  'russia': '/ˈrʌʃ.ə/',
  'russian': '/ˈrʌʃ.ən/',
  'india': '/ˈɪn.di.ə/',
  'indian': '/ˈɪn.di.ən/',
  'japan': '/dʒəˈpæn/',
  'japanese': '/ˌdʒæp.ənˈiːz/',
  'thailand': '/ˈtaɪ.lænd/',
  'thai': '/taɪ/',
  'canada': '/ˈkæn.ə.də/',
  'canadian': '/kəˈneɪ.di.ən/',
  'brazil': '/brəˈzɪl/',
  'brazilian': '/brəˈzɪl.jən/',
  'egypt': '/ˈiː.dʒɪpt/',
  'egyptian': '/iˈdʒɪp.ʃən/',

  // UNIT 5: CLASSROOM
  'board': '/bɔːd/',
  'desk': '/desk/',
  'pencil sharpener': '/ˈpen.səl ˌʃɑː.pən.ər/',
  'ruler': '/ˈruː.lər/',
  'rubber': '/ˈrʌb.ər/',
  'notebook': '/ˈnəʊt.bʊk/',
  'noticeboard': '/ˈnəʊ.tɪs.bɔːd/',
  'cassette player': '/kəˈset ˌpleɪ.ər/',

  // UNIT 10: FAMILY
  'great-grandfather': '/ˌɡreɪtˈɡræn.fɑː.ðər/',
  'great-grandmother': '/ˌɡreɪtˈɡræn.mʌð.ər/',
  'grandfather': '/ˈɡræn.fɑː.ðər/',
  'grandmother': '/ˈɡræn.mʌð.ər/',
  'father': '/ˈfɑː.ðər/',
  'mother': '/ˈmʌð.ər/',
  'uncle': '/ˈʌŋ.kəl/',
  'aunt': '/ɑːnt/',
  'brother': '/ˈbrʌð.ər/',
  'sister': '/ˈsɪs.tər/',
  'twin': '/twɪn/',
  'husband': '/ˈhʌz.bənd/',
  'wife': '/waɪf/',
  'cousin': '/ˈkʌz.ən/',
  "cousin's wife": '/ˈkʌz.ənz waɪf/',
  'daughter': '/ˈdɔː.tər/',
  'son': '/sʌn/',
  'niece': '/niːs/',
  'nephew': '/ˈnef.juː/',
  'brother-in-law': '/ˈbrʌð.ər.ɪn.lɔː/',
  'sister-in-law': '/ˈsɪs.tər.ɪn.lɔː/',
  'stepmother': '/ˈstepˌmʌð.ər/',
  'relative': '/ˈrel.ə.tɪv/',

  // UNIT 11: PHYSICAL ACTIONS
  'sit down': '/sɪt daʊn/',
  'stand up': '/stænd ʌp/',
  'ride': '/raɪd/',
  'jump': '/dʒʌmp/',
  'dance': '/dɑːns/',
  'climb': '/klaɪm/',
  'fall over': '/fɔːl ˈəʊ.vər/',
  'run': '/rʌn/',
  'lie down': '/laɪ daʊn/',
  'walk': '/wɔːk/',
  'get on': '/ɡet ɒn/',
  'get off': '/ɡet ɒf/',
  'tiptoe': '/ˈtɪp.təʊ/',
  'hop': '/hɒp/',
  'push': '/pʊʃ/',
  'pull': '/pʊl/',
  'hold': '/həʊld/',
  'carry': '/ˈkær.i/',
  'put sth down': '/pʊt ˈsʌm.θɪŋ daʊn/',
  'pick sth up': '/pɪk ˈsʌm.θɪŋ ʌp/',
  'touch': '/tʌtʃ/',
  'turn on': '/tɜːn ɒn/',
  'turn off': '/tɜːn ɒf/',
  'give': '/ɡɪv/',
  'drop': '/drɒp/',
  'break': '/breɪk/',
  'close': '/kləʊz/',
  'punch': '/pʌntʃ/',

  // UNIT 12: PARTS OF THE BODY
  'head': '/hed/',
  'hair': '/heər/',
  'forehead': '/ˈfɔː.hed/',
  'eyebrow': '/ˈaɪ.braʊ/',
  'eye': '/aɪ/',
  'ear': '/ɪər/',
  'cheek': '/tʃiːk/',
  'nose': '/nəʊz/',
  'mouth': '/maʊθ/',
  'tooth / teeth': '/tuːθ/ • /tiːθ/',
  'tongue': '/tʌŋ/',
  'chin': '/tʃɪn/',
  'neck': '/nek/',
  'shoulder': '/ˈʃəʊl.dər/',
  'arm': '/ɑːm/',
  'elbow': '/ˈel.bəʊ/',
  'hand': '/hænd/',
  'finger': '/ˈfɪŋ.ɡər/',
  'chest': '/tʃest/',
  'stomach': '/ˈstʌm.ək/',
  'back': '/bæk/',
  'leg': '/leɡ/',
  'knee': '/niː/',
  'foot / feet': '/fʊt/ • /fiːt/',
  'toe': '/təʊ/',
  'buttocks': '/ˈbʌt.əks/',
  'heel': '/hiːl/',

  // UNIT 13: PEOPLE
  'tall': '/tɔːl/',
  'short': '/ʃɔːt/',
  'average height': '/ˈæv.ər.ɪdʒ haɪt/',
  'slim': '/slɪm/',
  'overweight': '/ˌəʊ.vəˈweɪt/',
  'average weight': '/ˈæv.ər.ɪdʒ weɪt/',
  'good-looking': '/ˌɡʊdˈlʊk.ɪŋ/',
  'beautiful': '/ˈbjuː.tɪ.fəl/',
  'handsome': '/ˈhæn.səm/',
  'blond / blonde': '/blɒnd/',
  'short (hair)': '/ʃɔːt (heər)/',
  'medium-length': '/ˈmiː.di.əm leŋθ/',
  'long': '/lɒŋ/',
  'light brown': '/laɪt braʊn/',
  'dark brown': '/dɑːk braʊn/',
  'grey': '/ɡreɪ/',
  'black': '/blæk/',
  'straight': '/streɪt/',
  'curly': '/ˈkɜː.li/',
  'wavy': '/ˈweɪ.vi/',
  'brown eyes': '/braʊn aɪz/',
  'green eyes': '/ɡriːn aɪz/',
  'blue eyes': '/bluː aɪz/',
  'beard': '/bɪəd/',
  'mustache': '/məˈstɑːʃ/',

  // UNIT 14: CHARACTER
  'friendly': '/ˈfrend.li/',
  'kind': '/kaɪnd/',
  'funny': '/ˈfʌn.i/',
  'relaxed': '/rɪˈlækst/',
  'clever': '/ˈklev.ər/',
  'quiet': '/ˈkwaɪ.ət/',
  'serious': '/ˈsɪə.ri.əs/',

  // UNIT 15: RELATIONSHIPS
  'partner': '/ˈpɑːt.nər/',
  'relationship': '/rɪˈleɪ.ʃən.ʃɪp/',
  'go out with': '/ɡəʊ aʊt wɪð/',
  'ex-boyfriend': '/ˌeksˈbɔɪ.frend/',
  'get to know': '/ɡet tə nəʊ/',
  'get married': '/ɡet ˈmær.id/',
  'have a baby': '/hæv ə ˈbeɪ.bi/',
  'divorced': '/dɪˈvɔːst/',

  // UNIT 16: HOW I FEEL
  "what's the matter?": '/wɒts ðə ˈmæt.ər/',
  'tired': '/taɪəd/',
  'hungry': '/ˈhʌŋ.ɡri/',
  'thirsty': '/ˈθɜː.sti/',
  'boiling': '/ˈbɔɪ.lɪŋ/',
  'freezing': '/ˈfriː.zɪŋ/',
  'nervous': '/ˈnɜː.vəs/',
  'ill': '/ɪl/',
  'feel well': '/fiːl wel/',
  'happy': '/ˈhæp.i/',
  'sad': '/sæd/',
  'excited': '/ɪkˈsaɪ.tɪd/',
  'worried': '/ˈwʌr.id/',
  'angry': '/ˈæŋ.ɡri/',
  'frightened / scared': '/ˈfraɪ.tənd/ • /skeəd/',
  'upset': '/ʌpˈset/',
  'embarrassed': '/ɪmˈbær.əst/',
  'surprised': '/səˈpraɪzd/',
  'in love': '/ɪn lʌv/',
  'sleepy': '/ˈsliː.pi/',
  'bossy': '/ˈbɒs.i/',

  // UNIT 17: MY ROUTINE
  'get up': '/ɡet ʌp/',
  'have a shower': '/hæv ə ˈʃaʊ.ər/',
  'get dressed': '/ɡet drest/',
  'have breakfast': '/hæv ˈbrek.fəst/',
  'leave home': '/liːv həʊm/',
  'get to work': '/ɡet tə wɜːk/',
  'finish work': '/ˈfɪn.ɪʃ wɜːk/',
  'have dinner': '/hæv ˈdɪn.ər/',
  'go to bed': '/ɡəʊ tə bed/',
  'sleep': '/sliːp/',

  // UNIT 18: CLOTHES
  'shirt': '/ʃɜːt/',
  'sweater': '/ˈswet.ər/',
  'trousers': '/ˈtraʊ.zəz/',
  'skirt': '/skɜːt/',
  'dress': '/dres/',
  't-shirt': '/ˈtiː.ʃɜːt/',
  'jacket': '/ˈdʒæk.ɪt/',
  'coat': '/kəʊt/',
  'scarf': '/skɑːf/',
  'tie': '/taɪ/',
  'belt': '/belt/',
  'watch': '/wɒtʃ/',
  'glasses': '/ˈɡlɑː.sɪz/',
  'handbag': '/ˈhænd.bæɡ/',
  'sock': '/sɒk/',
  'glove': '/ɡlʌv/',
  'sandal': '/ˈsæn.dəl/',

  // UNIT 19: DESCRIBING CLOTHES
  'small': '/smɔːl/',
  'big': '/bɪɡ/',
  'cheap': '/tʃiːp/',
  'expensive': '/ɪkˈspen.sɪv/',
  'formal': '/ˈfɔː.məl/',
  'casual': '/ˈkæʒ.ju.əl/',
  'tight': '/taɪt/',
  'loose': '/luːs/',
  'comfortable': '/ˈkʌm.fə.tə.bəl/',
  'uncomfortable': '/ʌnˈkʌm.fə.tə.bəl/',

  // UNIT 20: MONEY
  'how much does it cost? / how much is it?': '/haʊ mʌtʃ dʌz ɪt kɒst/ • /haʊ mʌtʃ ɪz ɪt/',
  'pay in cash': '/peɪ ɪn kæʃ/',
  'change': '/tʃeɪndʒ/',
  'pay by credit card': '/peɪ baɪ ˈkred.ɪt kɑːd/',
  'enter': '/ˈen.tər/',
  'debit card': '/ˈdeb.ɪt kɑːd/',
  'cheque': '/tʃek/',
  'receipt': '/rɪˈsiːt/',
  'price': '/praɪs/',
  'spend money on sth': '/spend ˈmʌn.i ɒn ˈsʌm.θɪŋ/',
  'bill online': '/bɪl ˈɒn.laɪn/',
  'sell': '/sel/',
  'fare': '/feər/',
  'lottery': '/ˈlɒt.ər.i/',

  // UNIT 21: WEATHER
  'sunny': '/ˈsʌn.i/',
  'sunshine': '/ˈsʌn.ʃaɪn/',
  'cloudy': '/ˈklaʊ.di/',
  'cloud': '/klaʊd/',
  'foggy': '/ˈfɒɡ.i/',
  'rainy': '/ˈreɪ.ni/',
  'rain': '/reɪn/',
  'icy': '/ˈaɪ.si/',
  'windy': '/ˈwɪn.di/',
  'wind': '/wɪnd/',
  'changeable': '/ˈtʃeɪn.dʒə.bəl/',
  'pleasant': '/ˈplez.ənt/',
  'dry': '/draɪ/',
  'humid': '/ˈhjuː.mɪd/',
  'storm': '/stɔːm/',
  'breeze': '/briːz/',
  'thunder': '/ˈθʌn.dər/',
  'lightning': '/ˈlaɪt.nɪŋ/',

  // UNIT 22: ILLNESS
  'a headache': '/ə ˈhed.eɪk/',
  'toothache': '/ˈtuːθ.eɪk/',
  'a sore throat': '/ə sɔː θrəʊt/',
  'stomachache': '/ˈstʌm.ək.eɪk/',
  'a cold': '/ə kəʊld/',
  'a cough': '/ə kɒf/',
  'flu': '/fluː/',
  'backache': '/ˈbæk.eɪk/',
  'have a temperature': '/hæv ə ˈtem.prə.tʃər/',

  // UNIT 24: MEAT & FISH
  'cow / beef': '/kaʊ/ • /biːf/',
  'sheep / lamb': '/ʃiːp/ • /læm/',
  'pig / pork': '/pɪɡ/ • /pɔːk/',
  'chicken': '/ˈtʃɪk.ɪn/',
  'duck': '/dʌk/',
  'salmon': '/ˈsæm.ən/',
  'tuna': '/ˈtjuː.nə/',
  'squid': '/skwɪd/',
  'prawn': '/prɔːn/',
  'crab': '/kræb/',
  'mussel': '/ˈmʌs.əl/',

  // UNIT 25: FRUIT & VEGETABLE
  'banana': '/bəˈnɑː.nə/',
  'orange': '/ˈɒr.ɪndʒ/',
  'peach': '/piːtʃ/',
  'apple': '/ˈæp.əl/',
  'pear': '/peər/',
  'lemon': '/ˈlem.ən/',
  'mango': '/ˈmæŋ.ɡəʊ/',
  'strawberry': '/ˈstrɔː.bər.i/',
  'grape': '/ɡreɪp/',
  'avocado': '/ˌæv.əˈkɑː.dəʊ/',
  'potato': '/pəˈteɪ.təʊ/',
  'bean': '/biːn/',
  'onion': '/ˈʌn.jən/',
  'cabbage': '/ˈkæb.ɪdʒ/',
  'pea': '/piː/',
  'cauliflower': '/ˈkɒl.ɪˌflaʊ.ər/',
  'aubergine': '/ˈəʊ.bə.ʒiːn/',
  'mushroom': '/ˈmʌʃ.ruːm/',
  'garlic': '/ˈɡɑː.lɪk/',
  'chilli': '/ˈtʃɪl.i/',
  'lettuce': '/ˈlet.ɪs/',
  'tomato': '/təˈmɑː.təʊ/',
  'cucumber': '/ˈkjuː.kʌm.bər/',
  'raw': '/rɔː/',
  'cooked': '/kʊkt/',
  'courgette': '/kʊəˈʒet/',

  // UNIT 26: IN A SHOP
  'milk': '/mɪlk/',
  'bread': '/bred/',
  'butter': '/ˈbʌt.ər/',
  'egg': '/eɡ/',
  'a piece of cheese': '/ə piːs əv tʃiːz/',
  'sugar': '/ˈʃʊɡ.ər/',
  'cake': '/keɪk/',
  'jam': '/dʒæm/',
  'noodle': '/ˈnuː.dəl/',
  'olive oil': '/ˈɒl.ɪv ɔɪl/',
  'a carton of juice': '/ə ˈkɑː.tən əv dʒuːs/',
  'a packet of rice': '/ə ˈpæk.ɪt əv raɪs/',
  'a can of soda': '/ə kæn əv ˈsəʊ.də/',
  'a bottle of wine': '/ə ˈbɒt.əl əv waɪn/',
  'a jar of jam': '/ə dʒɑːr əv dʒæm/',
  'a tin of tomatoes': '/ə tɪn əv təˈmɑː.təʊz/',
  'a box of matches': '/ə bɒks əv ˈmætʃ.ɪz/',

  // UNIT 27: IN CAFÉ & RESTAURANT
  'black coffee': '/ˌblæk ˈkɒf.i/',
  'cappuccino': '/ˌkæp.ʊˈtʃiː.nəʊ/',
  'espresso': '/esˈpres.əʊ/',
  'hot chocolate': '/ˌhɒt ˈtʃɒk.lət/',
  'baguette': '/bæˈɡet/',
  'sandwich': '/ˈsæn.wɪdʒ/',
  'salt': '/sɔːlt/',
  'pepper': '/ˈpep.ər/',
  'spoon': '/spuːn/',
  'bottle of mineral water': '/ˈbɒt.əl əv ˈmɪn.ər.əl ˈwɔː.tər/',
  'glass of red wine': '/ɡlɑːs əv red waɪn/',
  'vinegar': '/ˈvɪn.ɪ.ɡər/',
  'napkin': '/ˈnæp.kɪn/',
  'bowl': '/bəʊl/',
  'plate': '/pleɪt/',
  'fork': '/fɔːk/',

  // UNIT 32: ROAD & TRAFFIC
  'junction': '/ˈdʒʌŋk.ʃən/',
  'speed camera': '/ˈspiːd ˌkæm.rə/',
  'roundabout': '/ˈraʊnd.ə.baʊt/',
  'road sign': '/ˈrəʊd saɪn/',
  'traffic jam': '/ˈtræf.ɪk dʒæm/',
  'petrol station': '/ˈpet.rəl ˌsteɪ.ʃən/',
  'car park': '/ˈkɑː pɑːk/',
  'traffic light': '/ˈtræf.ɪk laɪt/',
  'pavement': '/ˈpeɪv.mənt/',
  'pedestrian crossing': '/pəˌdes.tri.ən ˈkrɒs.ɪŋ/',

  // UNIT 33: SIGNS & NOTICES
  'ladies / wc women': '/ˈleɪ.diz/ • /ˌdʌb.əl.juːˈsiː ˈwɪm.ɪn/',
  'gents / wc men': '/dʒents/ • /ˌdʌb.əl.juːˈsiː men/',
  'entrance / way in': '/ˈen.trəns/ • /weɪ ɪn/',
  'exit / way out': '/ˈek.sɪt/ • /weɪ aʊt/',
  'no entry': '/ˌnəʊ ˈen.tri/',
  'no smoking': '/ˌnəʊ ˈsməʊ.kɪŋ/',
  'no parking': '/ˌnəʊ ˈpɑː.kɪŋ/',
  'do not disturb': '/duː nɒt dɪˈstɜːb/',
  'queue here': '/kjuː hɪər/',
  'out of order': '/ˌaʊt əv ˈɔː.dər/',

  // UNIT 35: TOWN
  'castle': '/ˈkɑː.səl/',
  'palace': '/ˈpæl.ɪs/',
  'statue': '/ˈstætʃ.uː/',
  'church': '/tʃɜːtʃ/',
  'temple': '/ˈtem.pəl/',
  'mosque': '/mɒsk/',
  'market': '/ˈmɑː.kɪt/',
  'park': '/pɑːk/',
  'museum': '/mjuːˈziː.əm/',
  'bridge': '/brɪdʒ/',

  // UNIT 36: COUNTRYSIDE
  'hill': '/hɪl/',
  'farmer': '/ˈfɑː.mər/',
  'valley': '/ˈvæl.i/',
  'grass': '/ɡrɑːs/',
  'path': '/pɑːθ/',
  'paddy field': '/ˈpæd.i fiːld/',
  'lake': '/leɪk/',
  'wood': '/wʊd/',
  'boat': '/bəʊt/',

  // UNIT 38: MY HOME
  'block of flats': '/ˌblɒk əv ˈflæts/',
  'town centre': '/ˌtaʊn ˈsen.tər/',
  'on the first floor': '/ɒn ðə ˈfɜːst flɔːr/',
  'garden': '/ˈɡɑː.dən/',
  'steps': '/steps/',
  'rubbish': '/ˈrʌb.ɪʃ/',
  'stairs': '/steəz/',
  'lift': '/lɪft/',
  'balcony': '/ˈbæl.kə.ni/',
  'basement': '/ˈbeɪs.mənt/',

  // UNIT 39: KITCHEN
  'shelf': '/ʃelf/',
  'tap': '/tæp/',
  'microwave': '/ˈmaɪ.krə.weɪv/',
  'frying pan': '/ˈfraɪ.ɪŋ pæn/',
  'freezer': '/ˈfriː.zər/',
  'cooker': '/ˈkʊk.ər/',
  'sink': '/sɪŋk/',
  'saucer': '/ˈsɔː.sər/',
  'hob': '/hɒb/',
  'oven': '/ˈʌv.ən/',
  'fridge': '/frɪdʒ/',

  // UNIT 40: BATHROOM & BEDROOM
  'single bed': '/ˈsɪŋ.ɡəl bed/',
  'bedside table': '/ˈbed.saɪd ˌteɪ.bəl/',
  'chest of drawers': '/ˌtʃest əv ˈdrɔːz/',
  'wardrobe': '/ˈwɔːr.droʊb/',
  'shower': '/ˈʃaʊ.ər/',
  'bath': '/bɑːθ/',
  'washbasin': '/ˈwɒʃˌbeɪ.sən/',
  'towel': '/taʊəl/',
  'mirror': '/ˈmɪr.ər/',

  // UNIT 41: LIVING ROOM
  'window': '/ˈwɪn.dəʊ/',
  'light': '/laɪt/',
  'ceiling': '/ˈsiː.lɪŋ/',
  'curtain': '/ˈkɜː.tən/',
  'cushion': '/ˈkʊʃ.ən/',
  'lamp': '/læmp/',
  'armchair': '/ˈɑːm.tʃeər/',
  'fireplace': '/ˈfaɪə.pleɪs/',
  'rug': '/rʌɡ/',
  'carpet': '/ˈkɑː.pɪt/',

  // UNIT 42: SCHOOL
  'chemistry': '/ˈkem.ɪ.stri/',
  'biology': '/baɪˈɒl.ə.dʒi/',
  'physics': '/ˈfɪz.ɪks/',
  'geography': '/dʒiˈɒɡ.rə.fi/',
  'history': '/ˈhɪs.tər.i/',
  'literature': '/ˈlɪt.rə.tʃər/',
  'math': '/mæθ/',
  'pe (physical education)': '/ˌpiːˈiː (ˌfɪz.ɪ.kəl ed.jʊˈkeɪ.ʃən)/',
  'art': '/ɑːt/',
  'music': '/ˈmjuː.zɪk/',

  // UNIT 44 & 45: JOBS
  'a police officer': '/ə pəˈliːs ˌɒf.ɪ.sər/',
  'a businessman / businesswoman': '/ə ˈbɪz.nɪs.mæn/ • /ˈbɪz.nɪsˌwʊm.ən/',
  'a shop assistant': '/ə ˈʃɒp əˌsɪs.tənt/',
  'a builder': '/ə ˈbɪl.dər/',
  'a nurse': '/ə nɜːs/',
  'a teacher': '/ə ˈtiː.tʃər/',
  'a secretary': '/ə ˈsek.rə.tər.i/',
  'a hairdresser': '/ə ˈheəˌdres.ər/',
  'a chef': '/ə ʃef/',
  'a dentist': '/ə ˈden.tɪst/',
  'a soldier': '/ə ˈsəʊl.dʒər/',
  'a cleaner': '/ə ˈkliː.nər/',
  'a lorry driver': '/ə ˈlɒr.i ˌdraɪ.vər/',
  'a vet': '/ə vet/',
  'a pilot': '/ə ˈpaɪ.lət/',

  // UNIT 46: COMPUTER
  'webcam': '/ˈweb.kæm/',
  'printer': '/ˈprɪn.tər/',
  'screen': '/skriːn/',
  'disk': '/dɪsk/',
  'mouse': '/maʊs/',
  'memory stick': '/ˈmem.ər.i stɪk/',
  'speaker': '/ˈspiː.kər/',
  'hard copy / printout': '/ˌhɑːd ˈkɒp.i/ • /ˈprɪnt.aʊt/',
  'keyboard': '/ˈkiː.bɔːd/',
  'mouse mat': '/ˈmaʊs mæt/',
  'pc (personal computer)': '/ˌpiːˈsiː (ˌpɜː.sən.əl kəmˈpjuː.tər)/',
  'laptop': '/ˈlæp.tɒp/',
  'hard drive': '/ˈhɑːd draɪv/',
  'document': '/ˈdɒk.jə.mənt/',
  'cut': '/kʌt/',
  'paste': '/peɪst/',
  'folder': '/ˈfəʊl.dər/',
  'print': '/prɪnt/',
  'save': '/seɪv/',

  // UNIT 47: EMAIL AND THE INTERNET
  'email address': '/ˈiː.meɪl əˌdres/',
  'web address': '/ˈweb əˌdres/',
  'search engine': '/ˈsɜːtʃ ˌen.dʒɪn/',
  'surfing the net': '/ˈsɜː.fɪŋ ðə net/',
  'download': '/ˌdaʊnˈləʊd/',

  // UNIT 48: SAY WHAT I LIKE
  'love': '/lʌv/',
  'like': '/laɪk/',
  "i think it's ok": '/aɪ θɪŋk ɪts ˌəʊˈkeɪ/',
  'quite like': '/kwaɪt laɪk/',
  'really like': '/ˈrɪə.li laɪk/',
  "don't like": '/dəʊnt laɪk/',
  "don't like it very much": '/dəʊnt laɪk ɪt ˈver.i mʌtʃ/',
  'hate': '/heɪt/',

  // UNIT 49: SPORT
  'football / soccer': '/ˈfʊt.bɔːl/ • /ˈsɒk.ər/',
  'pitch': '/pɪtʃ/',
  'goal': '/ɡəʊl/',
  'rugby': '/ˈrʌɡ.bi/',
  'rugby ball': '/ˈrʌɡ.bi bɔːl/',
  'ice hockey': '/ˈaɪs ˌhɒk.i/',
  'rink': '/rɪŋk/',
  'stick': '/stɪk/',
  'volleyball': '/ˈvɒl.i.bɔːl/',
  'court': '/kɔːt/',
  'net': '/net/',
  'tennis': '/ˈten.ɪs/',
  'racket': '/ˈræk.ɪt/',
  'basketball': '/ˈbɑː.skɪt.bɔːl/',
  'basket': '/ˈbɑː.skɪt/',

  // UNIT 50: ACTIVITIES
  'camping': '/ˈkæm.pɪŋ/',
  'skiing': '/ˈskiː.ɪŋ/',
  'go to the cinema': '/ɡəʊ tə ðə ˈsɪn.ə.mə/',
  'go to the gym': '/ɡəʊ tə ðə dʒɪm/',
  'cards': '/kɑːdz/',
  'table tennis': '/ˈteɪ.bəl ˌten.ɪs/',
  'computer games': '/kəmˈpjuː.tə ɡeɪmz/',
  'the guitar': '/ðə ɡɪˈtɑːr/',
  'traveling': '/ˈtræv.əl.ɪŋ/',
  'flower arranging': '/ˈflaʊ.ər əˌreɪn.dʒɪŋ/',
  'painting': '/ˈpeɪn.tɪŋ/',
  'collect things': '/kəˈlekt θɪŋz/',
  'spend time with friends': '/spend taɪm wɪð frendz/',
  'make my own clothes': '/meɪk maɪ əʊn kləʊðz/',

  // UNIT 52: FILMS
  'thriller': '/ˈθrɪl.ər/',
  'comedy': '/ˈkɒm.ə.di/',
  'war film': '/ˈwɔː fɪlm/',
  'love story': '/ˈlʌv ˌstɔː.ri/',
  'action film': '/ˈæk.ʃən fɪlm/',
  'horror film': '/ˈhɒr.ə fɪlm/',

  // UNIT 53: MEDIA
  'media': '/ˈmiː.di.ə/',
  'magazine': '/ˌmæɡ.əˈziːn/',
  'reporter': '/rɪˈpɔː.tər/',
  'disaster': '/dɪˈzɑː.stər/',
  'celebrity': '/səˈleb.rə.ti/',
  'advertisement': '/ədˈvɜː.tɪs.mənt/',

  // UNIT 54 & 55: HOLIDAY & HOTEL ROOM
  'book the flight': '/bʊk ðə flaɪt/',
  'accommodation': '/əˌkɒm.əˈdeɪ.ʃən/',
  'passport': '/ˈpɑːs.pɔːt/',
  'travel insurance': '/ˈtræv.əl ɪnˌʃʊə.rəns/',
  'foreign currency': '/ˌfɒr.ən ˈkʌr.ən.si/',
  'pack a suitcase': '/pæk ə ˈsuːt.keɪs/',
  'hire a car': '/ˈhaɪər ə kɑːr/',
  'air conditioning': '/ˈeə kənˌdɪʃ.ən.ɪŋ/',
  'facility': '/fəˈsɪl.ə.ti/',
  'single room': '/ˌsɪŋ.ɡəl ˈruːm/',
  'bed': '/bed/',
  'double bed': '/ˈdʌb.əl bed/',
  'king-size bed': '/kɪŋ.saɪz bed/',
  'queen-size bed': '/kwiːn.saɪz bed/',
  'pillow': '/ˈpɪl.oʊ/',
  'blanket': '/ˈblæŋ.kɪt/',
  'sheet': '/ʃiːt/',
  'hanger': '/ˈhæŋ.ər/',
  'chair': '/tʃer/',

  // UNIT 56: AIRPORT
  'passenger': '/ˈpæs.ən.dʒər/',
  'luggage': '/ˈlʌɡ.ɪdʒ/',
  'trolley': '/ˈtrɒl.i/',
  'check-in desk': '/ˈtʃek.ɪn desk/',
  'window seat': '/ˈwɪn.dəʊ siːt/',
  'boarding card': '/ˈbɔː.dɪŋ kɑːd/',
  'passport control': '/ˈpɑːs.pɔːt kənˌtrəʊl/',
  'baggage reclaim': '/ˈbæɡ.ɪdʒ rɪˌkleɪm/',
  'customs': '/ˈkʌs.təmz/',

  // UNIT 57: BEACH HOLIDAY
  'resort': '/rɪˈzɔːt/',
  'get a bus': '/ɡet ə bʌs/',
  'rent': '/rent/',
  'sunbathe': '/ˈsʌn.beɪð/',
  'lie': '/laɪ/',
  'go for a walk': '/ɡəʊ fɔːr ə wɔːk/',
  'swimming costume': '/ˈswɪm.ɪŋ ˌkɒs.tjuːm/',

  // UNIT 58: HOLIDAY SIGHTSEEING
  'map': '/mæp/',
  'guidebook': '/ˈɡaɪd.bʊk/',
  'go sightseeing': '/ɡəʊ ˈsaɪtˌsiː.ɪŋ/',
  'art gallery': '/ˈɑːt ˌɡæl.ər.i/',
  'look round': '/lʊk raʊnd/',
  'get lost': '/ɡet lɒst/',

  // UNIT 59: BANK & POST OFFICE
  'cash machine (atm)': '/ˈkæʃ məˌʃiːn (ˌeɪ.tiːˈem)/',
  'change into': '/tʃeɪndʒ ˈɪn.tuː/',
  'currency': '/ˈkʌr.ən.si/',
  'sign': '/saɪn/',
  'commission': '/kəˈmɪʃ.ən/',
  'address': '/əˈdres/',
  'envelope': '/ˈen.və.ləʊp/',
  'postman': '/ˈpəʊst.mən/',
  'post office': '/ˈpəʊst ˌɒf.ɪs/',
  'stamp': '/stæmp/',
  'postcode': '/ˈpəʊst.kəʊd/',
};

/**
 * Generates an approximate IPA transcription for custom English words not in the dictionary
 */
function approximateWordIpa(rawWord: string): string {
  const w = rawWord
    .toLowerCase()
    .replace(/[^a-z']/g, '');
  if (!w) return '';

  // Check if individual word is in dictionary
  if (IPA_DICTIONARY[w]) {
    return IPA_DICTIONARY[w].replace(/^\/|\/$/g, '');
  }

  let ipa = w
    .replace(/tion$/g, 'ʃən')
    .replace(/sion$/g, 'ʒən')
    .replace(/ture$/g, 'tʃər')
    .replace(/igh/g, 'aɪ')
    .replace(/ough/g, 'ɔː')
    .replace(/ph/g, 'f')
    .replace(/sh/g, 'ʃ')
    .replace(/ch/g, 'tʃ')
    .replace(/th/g, 'θ')
    .replace(/qu/g, 'kw')
    .replace(/ck/g, 'k')
    .replace(/ee/g, 'iː')
    .replace(/ea/g, 'iː')
    .replace(/oo/g, 'uː')
    .replace(/ou/g, 'aʊ')
    .replace(/ow/g, 'aʊ')
    .replace(/ai/g, 'eɪ')
    .replace(/ay/g, 'eɪ')
    .replace(/oi/g, 'ɔɪ')
    .replace(/oy/g, 'ɔɪ')
    .replace(/ar/g, 'ɑːr')
    .replace(/er$/g, 'ər')
    .replace(/or/g, 'ɔːr')
    .replace(/ing$/g, 'ɪŋ')
    .replace(/y$/g, 'i')
    .replace(/j/g, 'dʒ')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/c/g, 'k');

  return ipa;
}

/**
 * Returns the IPA phonetic transcription for an English word or phrase.
 */
export function getPhonetic(word: string, explicitPhonetic?: string): string {
  if (explicitPhonetic && explicitPhonetic.trim()) {
    const p = explicitPhonetic.trim();
    return p.startsWith('/') ? p : `/${p}/`;
  }

  if (!word || !word.trim()) return '';

  const normalized = word
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ');

  if (IPA_DICTIONARY[normalized]) {
    return IPA_DICTIONARY[normalized];
  }

  // Handle slash-separated words if each side is in dictionary
  if (normalized.includes('/')) {
    const parts = normalized.split('/').map(p => p.trim()).filter(Boolean);
    const partIpas = parts.map(p => {
      if (IPA_DICTIONARY[p]) return IPA_DICTIONARY[p];
      const approx = partsToIpa(p);
      return approx ? `/${approx}/` : '';
    }).filter(Boolean);
    if (partIpas.length > 0) {
      return partIpas.join(' • ');
    }
  }

  const approx = partsToIpa(normalized);
  return approx ? `/${approx}/` : '';
}

function partsToIpa(phrase: string): string {
  const tokens = phrase.split(/\s+/).filter(Boolean);
  return tokens
    .map(tok => {
      const clean = tok.replace(/^[^a-z]+|[^a-z]+$/g, '');
      if (IPA_DICTIONARY[clean]) {
        return IPA_DICTIONARY[clean].replace(/^\/|\/$/g, '');
      }
      return approximateWordIpa(clean);
    })
    .filter(Boolean)
    .join(' ');
}
