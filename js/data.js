/*
 * Clean City – content data (WEDE5020 Part 3)
 * Pages build their service lists, event lists, map markers and enquiry answers
 * from this one place, so a price or a date only has to be changed once.
 *
 * NOTE: prices, spots and dates below are illustrative sample data for the
 * assessment. Replace them with the figures from your Part 1 proposal if they differ.
 */
window.CC_DATA = {
  areas: [
    { id: 'braamfontein', name: 'Braamfontein', lat: -26.1929, lng: 28.0305, pickupDay: 1,
      place: 'Braamfontein Office', blurb: 'Main hub for waste coordination and volunteer sign-ups.' },
    { id: 'newtown', name: 'Newtown', lat: -26.2036, lng: 28.0342, pickupDay: 3,
      place: 'Newtown Drop-Off Point', blurb: 'Bring paper, plastic, glass and metal any weekday.' },
    { id: 'hillbrow', name: 'Hillbrow', lat: -26.1895, lng: 28.0482, pickupDay: 5,
      place: 'Hillbrow Community Centre', blurb: 'Home of our clean-up events, workshops and community meetings.' }
  ],

  pricing: {
    pickup:      { base: 120, includedBags: 5, extraBag: 15 },
    business:    { base: 350, includedBins: 2, extraBin: 150 },
    workshop:    { base: 800, includedPeople: 30, extraPerson: 20 },
    partnership: [
      { name: 'Community Partner', monthly: 2500,  perk: 'Your logo on our website and event posters' },
      { name: 'Green Partner',     monthly: 5000,  perk: 'Everything above plus a sponsored monthly clean-up' },
      { name: 'City Champion',     monthly: 10000, perk: 'Everything above plus a sponsored Recycling 101 workshop series' }
    ]
  },

  services: [
    { id: 'dropoff',   name: 'Free recycling drop-off',   category: 'Drop-off',   icon: 'fa-box-archive',
      areas: ['newtown'], fromPrice: 0,    priceLabel: 'Free',
      description: 'Bring clean paper, plastic, glass and metal to our Newtown drop-off point any weekday between 08:00 and 17:00.',
      enquiryType: 'general' },
    { id: 'pickup',    name: 'Household pick-up',          category: 'Collection', icon: 'fa-truck',
      areas: ['braamfontein', 'newtown', 'hillbrow'], fromPrice: 120, priceLabel: 'From R120 per pick-up',
      description: 'We collect your sorted recyclables from your door once a week. The price covers up to five bags.',
      enquiryType: 'pickup' },
    { id: 'business',  name: 'Business collection',        category: 'Collection', icon: 'fa-building',
      areas: ['braamfontein', 'newtown', 'hillbrow'], fromPrice: 350, priceLabel: 'From R350 per month',
      description: 'Regular bin collections for shops, offices and restaurants, with a monthly recycling report.',
      enquiryType: 'business' },
    { id: 'cleanups',  name: 'Community clean-up events',  category: 'Community',  icon: 'fa-broom',
      areas: ['braamfontein', 'newtown', 'hillbrow'], fromPrice: 0,    priceLabel: 'Free',
      description: 'Join residents and volunteers to clear litter from streets and public spaces. Gloves and bags are provided.',
      enquiryType: 'volunteer' },
    { id: 'volunteer', name: 'Volunteer programme',        category: 'Community',  icon: 'fa-hands-holding-heart',
      areas: ['braamfontein', 'newtown', 'hillbrow'], fromPrice: 0,    priceLabel: 'Free',
      description: 'Give a few hours a month to sort recyclables, help at events or support our drop-off point.',
      enquiryType: 'volunteer' },
    { id: 'workshops', name: 'Recycling 101 workshop',     category: 'Education',  icon: 'fa-chalkboard-user',
      areas: ['newtown', 'hillbrow'], fromPrice: 800, priceLabel: 'R800 per session (up to 30 people)',
      description: 'A hands-on session on sorting recyclables correctly and cutting household waste. Ideal for schools and community groups.',
      enquiryType: 'workshop' },
    { id: 'schools',   name: 'School recycling programme', category: 'Education',  icon: 'fa-school',
      areas: ['braamfontein', 'hillbrow'], fromPrice: 800, priceLabel: 'R800 per session',
      description: 'A series of lessons and a class challenge that teaches learners to reduce, reuse and recycle.',
      enquiryType: 'workshop' },
    { id: 'partners',  name: 'Partnership and sponsorship', category: 'Business',  icon: 'fa-handshake',
      areas: ['braamfontein', 'newtown', 'hillbrow'], fromPrice: 2500, priceLabel: 'From R2 500 per month',
      description: 'Businesses can sponsor clean-ups, workshops and drop-off points and be recognised across our website and events.',
      enquiryType: 'partnership' }
  ],

  // Dates are ISO (YYYY-MM-DD). Past events are hidden automatically by the events list.
  events: [
    { id: 'student-day',  name: 'Braamfontein Student Recycling Day', date: '2026-11-07', time: '10:00 – 14:00', area: 'braamfontein', type: 'Drive',
      spots: 60, spotsLeft: 41, poster: 'images/event-poster-braamfontein-student-recycling-day.png', photo: 'images/braamfontein-skyline-johannesburg.jpg',
      photoAlt: 'Poster for the Braamfontein Student Recycling Day',
      summary: 'Bring your old bottles, cans and paper to our pop-up recycling stand near the university campuses.',
      details: 'Students can drop off clean recyclables and learn how to set up a recycling system in their residence. Volunteers will help with sorting and weighing.' },
    { id: 'braam-cleanup', name: 'Braamfontein Street Clean-Up', date: '2026-11-14', time: '08:00 – 11:00', area: 'braamfontein', type: 'Clean-up',
      spots: 40, spotsLeft: 12, poster: 'images/event-poster-braamfontein-street-clean-up.png',
      photo: 'images/braamfontein-skyline-johannesburg.jpg', photoAlt: 'Poster for the Braamfontein street clean-up',
      summary: 'Grab a pair of gloves and clear litter along the main streets and public spaces of Braamfontein.',
      details: 'Meet at the Braamfontein Office at 08:00. Gloves, bags and refreshments are provided. Wear closed shoes and bring water. No experience needed.' },
    { id: 'recycling-101', name: 'Recycling 101 Workshop', date: '2026-11-21', time: '10:00 – 12:00', area: 'newtown', type: 'Workshop',
      spots: 25, spotsLeft: 6, poster: 'images/event-poster-newtown-recycling-workshop.png',
      photo: 'images/newtown-plaza-johannesburg.jpg', photoAlt: 'Poster for the Recycling 101 workshop in Newtown',
      summary: 'A hands-on session on sorting recyclables correctly and getting the most from our drop-off points.',
      details: 'Learn what can and cannot be recycled, how to prepare items, and how to cut waste at home. Suitable for adults and learners aged 12 and older.' },
    { id: 'hillbrow-day', name: 'Hillbrow Community Day', date: '2026-11-28', time: '09:00 – 15:00', area: 'hillbrow', type: 'Community day',
      spots: 80, spotsLeft: 35, poster: 'images/event-poster-hillbrow-community-day.png',
      photo: 'images/hillbrow-street-johannesburg.jpg', photoAlt: 'Poster for Hillbrow Community Day',
      summary: 'A full day of clean-up activities, recycling drop-offs and family-friendly environmental education.',
      details: 'Join us at the Hillbrow Community Centre for clean-up teams in the morning and recycling games for children in the afternoon. Families are welcome.' },
    { id: 'plastic-drive', name: 'Newtown Plastic Bottle Drive', date: '2026-12-05', time: '09:00 – 13:00', area: 'newtown', type: 'Drive',
      spots: 30, spotsLeft: 18, poster: 'images/event-poster-newtown-plastic-bottle-drive.png', photo: 'images/recycling-plastic-bottles.jpg',
      photoAlt: 'Poster for the Newtown Plastic Bottle Drive',
      summary: 'Bring your rinsed plastic bottles and containers and watch the community total grow.',
      details: 'Rinse bottles, remove the lids and flatten them if you can. We will weigh every contribution and share the final total online.' },
    { id: 'youth-workshop', name: 'Hillbrow Youth Recycling Workshop', date: '2026-12-12', time: '10:00 – 12:30', area: 'hillbrow', type: 'Workshop',
      spots: 30, spotsLeft: 22, poster: 'images/event-poster-hillbrow-youth-recycling-workshop.png', photo: 'images/gallery-park-clean-up-volunteers.jpg',
      photoAlt: 'Poster for the Hillbrow Youth Recycling Workshop',
      summary: 'A fun, practical workshop for young people on recycling, upcycling and caring for their neighbourhood.',
      details: 'Participants make something useful from waste and learn how to start a recycling club at school. Refreshments provided.' }
  ]
};
