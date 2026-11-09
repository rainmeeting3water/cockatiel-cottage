/* English translation of the supplied Chinese educational summaries.
   Load after content.js. Historical source checks are preserved, not renewed by translation. */
(function (root) {
  'use strict';
  const original = root.CockatielContent;
  if (!original) throw new Error('Load content.js before content-en.js.');

  const sourceTitles = {
    'aav-cockatiel': 'AAV | Cockatiels (2025)',
    'aav-basic': 'AAV | Basic Care for Companion Birds',
    'aav-sleep': 'AAV | Providing Adequate Sleep',
    'aav-illness': 'AAV | Signs of Illness in Companion Birds',
    'vca-feeding': 'VCA | Feeding Pet Cockatiels',
    'vca-produce': 'VCA | Fruits and Vegetables in Birds’ Diets',
    'merck-hazards': 'Merck Veterinary Manual | Household Hazards for Pet Birds',
    'msd-toxins': 'MSD / Merck Veterinary Manual | Toxicoses of Pet Birds',
    'msd-emergency': 'MSD / Merck Veterinary Manual | Injuries and Accidents of Pet Birds',
    'uf-care': 'University of Florida College of Veterinary Medicine | How to Care for Your Pet Bird',
    'ovma-toxins': 'Oregon Veterinary Medical Association | Common Household Toxins',
    'xylitol-study': 'Gardner & Mitchell (2017) | Suspected xylitol poisoning in Cape sugarbirds; not a cockatiel study'
  };

  const basics = [
    { title: 'A little parrot from Australia', detail: 'Cockatiels come from Australia. Their scientific name is Nymphicus hollandicus. Lutino, normal grey and pearl are all cockatiels, with different feather colours and patterns.' },
    { title: 'A pet needs care for many years', detail: 'A bird needs daily meals, cleaning, company and safe activity for many years. Find a vet who treats birds before your bird gets sick.' },
    { title: 'Birds need time to themselves, too', detail: 'Cockatiels look for food, explore, preen their feathers and rest. If your bird moves away or does not want to play, let it have some quiet time.' },
    { title: 'The crest is just one clue', detail: 'Look at the crest, body posture and sounds together. One movement cannot tell you a bird’s mood or health. Each bird has its own favourite activities and times to play.' },
    { title: 'Practise in the game; observe real birds', detail: 'The game’s points, stories and vet tokens are for practice. They cannot tell you whether a real bird is sick, and they are not real vet fees.' }
  ];

  const colours = {
    lutino: { name: 'Lutino cockatiel', description: 'Pale yellow and creamy white feathers, often with orange cheeks. Feather colour does not tell us a bird’s personality. Take time to get to know each bird.' },
    grey: { name: 'Normal grey cockatiel', description: 'Mostly grey feathers, often with white wing patches and orange cheeks. Each bird looks a little different, and its appearance can change with age.' },
    pearl: { name: 'Pearl cockatiel', description: 'Pearl-like patterns appear on the feathers and may change after moulting. Pearl, lutino and normal grey birds are all the same species: cockatiels.' }
  };

  const foods = {
    pellets: { name: 'Pellets made for cockatiels', aliases: ['formulated food', 'bird pellets', 'pelleted food', 'cockatiel food'], category: 'Planning the daily diet', detail: 'Choose food made for cockatiels and your bird’s life stage. AAV and VCA give different advice on the mix, so ask a bird vet to help you choose. When changing food, record how much your bird eats and its weight. A full bowl does not mean your bird is eating.' },
    seeds: { name: 'Seeds and millet sprays', aliases: ['seeds', 'millet', 'millet spray', 'sunflower seed', 'sunflower seeds'], category: 'Planning the daily diet', detail: 'Do not feed only seeds or let your bird pick only the fatty ones. Seeds can be part of a balanced diet or a small training reward. Ask your vet how much to offer.' },
    broccoli: { name: 'Broccoli', aliases: ['broccoli florets'], category: 'Vegetables', detail: 'Wash well and cut into small florets. Offer a little alongside other vegetables, with no salt, oil or sauce.' },
    carrot: { name: 'Carrot', aliases: ['carrots', 'shredded carrot'], category: 'Vegetables', detail: 'Wash well, then cut finely or grate. Offer a little. Do not use a seasoned side dish as bird food.' },
    greens: { name: 'Dark leafy vegetables', aliases: ['leafy greens', 'dark greens', 'spinach'], category: 'Vegetables', detail: 'Wash edible greens such as bok choy and kale, and offer small amounts of different kinds. Do not feed just one kind or offer wild plants with unknown names or sources.' },
    apple: { name: 'Apple flesh, with seeds removed', aliases: ['apples', 'seedless apple pieces'], category: 'Small amounts of fruit', detail: 'Remove the seeds and core, then cut the flesh into small pieces. Fruit contains sugar. Offer a little; it is not a complete diet.' },
    grape: { name: 'Grapes', aliases: ['fresh grapes'], category: 'Small amounts of fruit', detail: 'Wash, remove seeds and cut into small pieces. Offer only a little. This entry is for fresh grapes; do not assume raisins or candied grapes can be used instead.' },
    banana: { name: 'Banana', aliases: ['bananas'], category: 'Small amounts of fruit', detail: 'Offer a little fresh flesh. Bananas contain sugar, too. Do not feed sugar-coated or fried banana snacks.' },
    pumpkin: { name: 'Pumpkin', aliases: ['edible pumpkin', 'cooked pumpkin'], category: 'Vegetables', detail: 'Offer a little edible pumpkin with other foods, without seasoning. Let cooked food cool before serving, and remove leftovers within one hour.' },
    'sweet-potato': { name: 'Sweet potato', aliases: ['sweet potatoes', 'cooked sweet potato'], category: 'Vegetables', detail: 'Cook fully, let cool and serve small, unseasoned pieces. Sweet potato alone is not a complete diet. Remove uneaten cooked food promptly.' },
    rice: { name: 'Cooked brown rice and grains', aliases: ['brown rice', 'cooked rice', 'white rice', 'grains'], category: 'Small side portions', detail: 'Offer a little cooked brown rice with no salt or oil, after it has cooled. Remove leftovers within one hour. Fried rice and seasoned rice are not included.' },
    beans: { name: 'Fully cooked beans', aliases: ['cooked beans', 'legumes'], category: 'Small side portions', detail: 'Offer only edible beans that are fully cooked and unseasoned, a little at a time. Remove leftovers. This does not mean all raw beans are safe.' },
    pepper: { name: 'Bell pepper', aliases: ['sweet pepper', 'bell peppers', 'capsicum'], category: 'Vegetables', detail: 'Choose fresh, edible bell peppers. Wash, cut into small pieces and serve without seasoning. Offer a little, along with different vegetables.' },
    avocado: { name: 'Avocado', aliases: ['avocados'], category: 'Keep out of reach', detail: 'Do not feed avocado. If your bird eats it, or you think it has been exposed, contact a bird vet immediately. Do not wait for signs of illness.' },
    chocolate: { name: 'Chocolate and cocoa', aliases: ['dark chocolate', 'milk chocolate', 'cocoa powder'], category: 'Keep out of reach', detail: 'Do not feed any kind of chocolate or food containing cocoa. If your bird eats it by mistake, contact a bird vet immediately.' },
    caffeine: { name: 'Coffee, tea and caffeinated drinks', aliases: ['caffeinated drink', 'energy drink', 'milk tea', 'coffee grounds', 'tea leaves', 'coffee beans'], category: 'Keep out of reach', detail: 'Do not let your bird drink coffee, tea or other caffeinated drinks. Keep coffee beans, coffee grounds and tea leaves out of reach, too.' },
    alcohol: { name: 'Alcohol and alcoholic drinks', aliases: ['beer', 'wine', 'alcoholic drink', 'liquor'], category: 'Keep out of reach', detail: 'Do not offer alcohol or let your bird reach glasses or drinks containing alcohol. If you think it has swallowed alcohol, contact a vet immediately.' },
    allium: { name: 'Onion and garlic', aliases: ['onions', 'garlic cloves'], category: 'Do not feed', detail: 'Do not feed onion, garlic or dishes containing them. A food people can eat is not necessarily safe for a bird.' },
    'salty-oily': { name: 'Very salty, oily or heavily seasoned food', aliases: ['salt', 'crisps', 'potato chips', 'fries', 'fried food', 'ham', 'fried rice', 'salty snacks'], category: 'Do not feed', detail: 'Do not use salty snacks, fried food or heavily seasoned dishes as bird treats. Too much salt is dangerous, and oily food is not suitable for everyday feeding.' },
    spoiled: { name: 'Mouldy or spoiled food', aliases: ['mould', 'mouldy', 'moldy', 'spoiled', 'rancid'], category: 'Throw away immediately', detail: 'Throw away the whole portion and wash the food bowl. Do not just remove the mouldy part and feed the rest.' },
    'fruit-seeds': { name: 'Apple seeds and hard fruit stones', aliases: ['apple seeds', 'fruit pits', 'fruit stones', 'cherry pits', 'peach pits'], category: 'Remove before preparing fruit', detail: 'Remove seeds and hard stones before offering fruit flesh. A little apple flesh can be offered; this does not mean apple seeds are safe.' },
    xylitol: { name: 'Xylitol and sweetener products', aliases: ['sweetener', 'sugar-free gum', 'artificial sweetener'], category: 'Not enough information: do not feed', detail: 'There is not enough evidence to show that xylitol is safe for cockatiels. Suspected fatal poisoning after eating xylitol has been reported in other birds. Do not feed it. If your bird eats it by mistake, contact a vet immediately.' },
    'wild-plant': { name: 'Unidentified wild plants, mushrooms and houseplants', aliases: ['wild plant', 'wild grass', 'mushroom', 'wild mushroom', 'houseplant', 'leaves'], category: 'Not enough information: do not feed', detail: 'If the exact species, pesticide use or possible contamination is unknown, do not treat it as safe food. Looking similar is not enough. Do not let your bird taste it to find out.' },
    'mixed-treat': { name: 'Human food and treats with unknown ingredients', aliases: ['unknown food', 'snack', 'biscuit', 'cookie', 'cake', 'processed food', 'human treats'], category: 'Not enough information: do not feed', detail: 'Foods with the same name can have different ingredients. Check the full ingredient list and ask a bird vet. Do not feed a food just because you recognise its name.' }
  };

  const guides = {
    diet: { title: 'A daily diet needs a good mix', summary: 'Check that your bird is eating, not just that food is in the bowl.', bullets: ['Plan pellets, seeds and vegetables together. Do not feed only seeds, and do not assume a pellet-only diet suits every bird.', 'AAV and VCA give different advice on the mix. Birds of different ages and health needs may need different diets. Ask a bird vet about amounts.', 'When changing food, record how much your bird eats and its weight. Do not suddenly remove familiar food or let your bird go hungry.', 'Wash fruit and vegetables and cut them into small pieces. Remove uneaten cooked food within one hour. Be extra careful about food spoiling in hot weather.'] },
    cage: { title: 'A cage should be a safe home', summary: 'It needs enough space and safety, as well as looking nice.', bullets: ['Your bird must be able to stretch and spread its wings without its tail rubbing against the cage. Bars must not trap its head, and doors must latch securely.', 'Choose non-toxic materials that do not easily chip off when chewed. Avoid unknown metals that may contain lead or zinc, and items with damaged coatings.', 'Provide safe perches of suitable, varied widths. Do not use sandpaper-covered perches.', 'Keep food and water bowls away from directly below perches, so droppings do not fall into them. Check toys daily for sharp edges, loose pieces or threads that could trap feet.'] },
    clean: { title: 'Change the water and wash the bowl', summary: 'Clean water should always be available. Change it when it gets dirty.', bullets: ['Wash food and water bowls with soap and water every day, then rinse thoroughly. Topping up or a quick rinse does not remove the dirt.', 'Change cage paper daily and remove droppings and leftover food. Notice whether the droppings look different from usual.', 'Keep your bird away from sprays and fumes while cleaning. Follow product instructions, rinse well and let fresh air in. Do not mix cleaning products.', 'Do not add vitamins, juice or medicine to drinking water unless your vet tells you to.'] },
    sleep: { title: 'Give your bird a quiet night', summary: 'Think about both light and sound at bedtime.', bullets: ['Most pet birds need about 10–12 hours of sleep opportunity at night. Discuss the right routine for your bird with a bird vet.', 'Keep bedtime away from television, bright lights and noisy activity. Use a quiet sleeping location if needed.', 'Preening and short rests during the day are normal. You do not need to keep asking your bird to play. Contact a vet if your bird sleeps more than usual or seems weak.'] },
    flight: { title: 'Safe time outside the cage, with someone watching', summary: 'Prepare the room before inviting your bird out.', bullets: ['Close doors and windows. Switch off ceiling fans and wait until the blades stop completely. Address clear glass and mirrors so your bird does not fly into them.', 'Keep cats and dogs separate. Put away electrical cords, sharp objects, medicines, glue traps and unidentified plants.', 'Keep your bird away from the kitchen, flames, hot pans and open containers of water. Close the toilet lid, too.', 'Someone must watch the whole time. Let your bird choose to come out and return home. A bird with clipped wings can still escape or get hurt.'] },
    air: { title: 'Some air hazards are invisible', summary: 'No smell does not mean no danger.', bullets: ['Some PTFE non-stick coatings release gases when overheated that can kill birds. Keep cages far from the kitchen and heating products with these coatings.', 'Keep birds away from tobacco, smoke, fragrances, perfume, sprays, pesticides and fumes from cleaning products.', 'If you suspect harmful fumes, first keep people safe, then stop the exposure and contact a bird vet immediately. Do not wait for obvious illness.'] },
    health: { title: 'Learn what is normal for your bird', summary: 'Birds may hide illness, so small changes matter.', bullets: ['Notice how much your bird eats, how it moves, its calls and breathing each day. Check whether its droppings have changed.', 'Contact a bird vet promptly for constantly fluffed feathers, eating less, unusual sleepiness, abnormal discharge or changes in weight.', 'Find a regular bird vet and an emergency clinic in advance. Discuss how often your bird needs a health check.', 'Game points cannot check a real bird’s health. Looking normal does not prove a bird is well.'] },
    emergency: { title: 'These signs need a vet right away', summary: 'Trouble breathing, severe weakness, ongoing bleeding or possible poisoning cannot wait.', bullets: ['Open-mouth or laboured breathing, lying on the cage floor, inability to stand, poor response or ongoing bleeding need immediate help. Call a vet or emergency clinic that treats birds and arrange transport.', 'If you suspect poisoning, contact a vet immediately, even if there are no signs yet. Bring the substance’s packaging and note when exposure happened and what changed.', 'Avoid repeated handling and follow your vet’s transport instructions. Do not give medicine on your own, try to make your bird vomit, or force food or water into its mouth.', 'Children should get the adult responsible for the bird immediately. Do not wait until the game ends to help a real bird in danger.'] },
    companionship: { title: 'If your bird says no, stop', summary: 'Playing together is fun. An adult is still responsible for daily care.', bullets: ['Offer gentle play, exploring and looking for food. Also let your bird watch quietly, preen and rest.', 'An adult should supervise children playing with a bird. Do not chase, frighten or forcefully grab it.', 'Pause if your bird moves away or does not want to come closer. Do not keep touching it or make it obey just to earn rewards.', 'Before adding another bird, discuss health checks, a period of living separately and gradual introductions with a bird vet. Do not put a new bird straight into the same cage.'] }
  };

  function translated(record, words) {
    if (!words) throw new Error('Missing English content translation.');
    const copy = Object.assign({}, record, words);
    if (record.sourceIds) copy.sourceIds = record.sourceIds.slice();
    return copy;
  }

  root.CockatielEnglishContent = {
    checked: original.checked,
    sources: original.sources.map(source => {
      if (!sourceTitles[source.id]) throw new Error('Missing English source title.');
      return translated(source, {title: sourceTitles[source.id]});
    }),
    basics: original.basics.map((item,index) => translated(item, basics[index])),
    colors: original.colors.map(item => translated(item, colours[item.id])),
    foodIntro: '“Suitable in small amounts” does not mean unlimited food or a complete diet. Wash fruit and vegetables, cut them into small pieces and offer a little of each. Ask a bird vet about daily amounts and the mix of pellets and seeds; there is no one amount in grams for every bird. Never let a bird go hungry to make it change foods. If a food is not listed, do not feed it until you have checked.',
    foods: original.foods.map(item => {
      const words = foods[item.id];
      const copy = translated(item, words);
      copy.aliases = [...new Set([item.name, ...item.aliases, words.name, ...words.aliases])];
      return copy;
    }),
    guides: original.guides.map(item => translated(item, guides[item.id])),
    emergency: translated(original.emergency, {
      title: 'A real bird’s emergency needs a bird vet now',
      detail: 'For trouble breathing, severe weakness, ongoing bleeding or possible poisoning, contact a vet or emergency clinic that treats birds immediately. Do not give medicine on your own, try to make your bird vomit, or force food or water into its mouth.'
    }),
    reviewNotes: [
      'A bird vet still needs to review every item, especially diet planning, food changes and signs of illness. Children should also try reading it to check that it is clear.',
      'This is not a full list of dangerous foods. “Not enough information” and no search results never mean a food is safe.',
      'These are short educational summaries with links to the original sources. They do not include the sources’ full text, pictures or tables, or instructions for medicine doses.'
    ]
  };
})(globalThis);
