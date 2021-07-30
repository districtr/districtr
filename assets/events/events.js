const stateForEvent = {
  test: 'Pennsylvania',
  fyi: 'North Carolina',
  'unca-forsyth': 'North Carolina',
  buncombe: 'North Carolina',
  'common cause md ss': 'Maryland',
  'commoncause md ss': 'Maryland',
  'cc-md-ss': 'Maryland',
  'cc md ss': 'Maryland',
  'cc-nm-abq': 'New Mexico',
  centralsan: 'California',
  'mggg-nm': 'New Mexico',
  'pmc-demo': 'Wisconsin',
  pmc: 'Wisconsin',
  'pmc-districts': 'Wisconsin',
  powercoalition: 'Louisiana',
  'open-maps': 'Ohio',
  'fair-districts-oh': 'Ohio',
  'colorado-cc': 'Colorado',
  ttt: 'Colorado',
  nsfm: 'Wisconsin',
  'towsonu-baltimore': 'Maryland',
  fairmapstexas: 'Texas',
  'missouri-mapping': 'Missouri',
  'ourmapsmn': 'Minnesota',
  'micrc': 'Michigan',
  mesaaz: 'Arizona',
  slo_county: 'California',
  ourmapsne: 'Nebraska',
  prjusd: 'California',
  hia: 'Texas',
  onelovemi: 'Michigan',
  saccounty: 'California',
  fresno: 'California',
  fresnocity: 'California',
  nevadaco: 'California',
  sanmateoco: 'California',
  sanbenito: 'California',
  saccountymap: 'California',
  sonomaco: 'California',
  pasadena2021: 'California',
  goleta: 'California',
  sbcounty: 'California',
  'ks-fairmaps': 'Kansas',
  napa_county: 'California',
  san_jose: 'California',
  siskiyou: 'California',
  redwood: 'California',
  ventura_county: 'California',
  yolo_county: 'California',
  solano_county: 'California',
  'galeo': 'Georgia',
  ourmaps: 'Nebraska',
  marinco: 'California',
  commoncausepa: 'Pennsylvania',
  kingsco: 'California',
  mercedco: 'California',
  marinaca: 'California',
  arroyog: 'California',
  chulavista: 'California',
  camarillo: 'California',
  bellflower: 'California',
};

const validEventCodes = {
  test: 'pennsylvania',
  fyi: 'forsyth_nc',
  'unca-forsyth': 'forsyth_nc',
  buncombe: 'buncombe',
  'common cause md ss': 'maryland',
  'commoncause md ss': 'maryland',
  'cc-md-ss': 'maryland',
  'cc md ss': 'maryland',
  'cc-nm-abq': 'new_mexico',
  centralsan: 'ccsanitation2',
  'mggg-nm': ['new_mexico', 'new_mexico_bg', 'santafe'],
  'pmc-demo': ['wisconsin2020', 'wisconsin'],
  pmc: ['wisconsin2020', 'wisconsin'],
  'pmc-districts':['wisconsin2020','wisconsin'],
  powercoalition: 'batonrouge',
  'open-maps': ['ohio', 'akroncanton', 'cincinnati', 'clevelandeuclid', 'columbus', 'dayton', 'limaoh', 'mansfield', 'portsmouthoh', 'toledo', 'youngstown', 'ohcentral', 'ohakron', 'ohcin', 'ohcle', 'ohse', 'ohtoledo'],
  'fair-districts-oh': ['ohio', 'akroncanton', 'cincinnati', 'clevelandeuclid', 'columbus', 'dayton', 'limaoh', 'mansfield', 'portsmouthoh', 'toledo', 'youngstown', 'ohcentral', 'ohakron', 'ohcin', 'ohcle', 'ohse', 'ohtoledo'],
  'colorado-cc': 'colorado',
  ttt: [],
  nsfm: 'wisconsin2020',
  'towsonu-baltimore': 'baltimore',
  fairmapstexas: 'texas',
  'missouri-mapping': 'missouri',
  'ourmapsmn': ['minnesota','olmsted','washington_mn','stlouis_mn','rochestermn'],
  'micrc': 'michigan',
  mesaaz: 'mesaaz',
  slo_county: 'sanluiso',
  ourmapsne: 'nebraska',
  prjusd: 'pasorobles',
  'hia': ['texas', 'harristx', 'houston'],
  onelovemi: 'michigan',
  saccounty: 'sacramento',
  saccountymap: 'sacramento',
  fresno: 'ca_fresno',
  fresnocity: 'ca_fresno_ci',
  nevadaco: 'ca_nevada',
  sanmateoco: 'ca_sm_county',
  sanbenito: 'ca_sanbenito',
  pasadena2021: 'ca_pasadena',
  sonomaco: 'ca_sonoma',
  'ks-fairmaps': 'kansas',
  napa_county: 'napacounty2021',
  san_jose: 'sanjoseca',
  siskiyou: 'ca_siskiyou',
  redwood: 'redwood',
  ventura_county: 'ca_ventura',
  yolo_county: 'ca_yolo',
  solano_county: 'ca_solano',
  'galeo': 'hall_ga',
  goleta: 'ca_goleta',
  sbcounty: 'ca_santabarbara',
  ourmaps: 'nebraska',
  marinco: 'ca_marin',
  commoncausepa: 'pennsylvania',
  kingsco: 'ca_kings',
  mercedco: 'ca_merced',
  marinaca: 'ca_marina',
  arroyog: 'ca_arroyo',
  chulavista: 'ca_cvista',
  bellflower: 'ca_bellflower',
  camarillo: 'ca_camarillo',
};

const coi_events = [
  "fyi",
  'common cause md ss',
  'commoncause md ss',
  'cc-md-ss',
  'cc md ss',
  'cc-nm-abq',
  'mggg-nm',
  'pmc-demo',
  'pmc',
  'powercoalition',
  'open-maps',
  'fair-districts-oh',
  'colorado-cc',
  'nsfm',
  'fairmapstexas',
  'missouri-mapping',
  'ttt',
  'ourmapsmn',
  'micrc',
  'mesaaz',
  'slo_county',
  'ourmapsne',
  'onelovemi',
  'ks-fairmaps',
  'napa_county',
  'san_jose',
  'siskiyou',
  'redwood',
  'ventura_county',
  'yolo_county',
  'solano_county',
  'commoncausepa'
];

const hybrid_events = [
  // 'mesaaz',
  'hia',
  'saccounty',
  'saccountymap',
  'fresno',
  'fresnocity',
  'nevadaco',
  'sanmateoco',
  'sanbenito',
  'sonomaco',
  'pasadena2021',
  'kingsco',
  'mercedco',
  'goleta',
  'sbcounty',
  'marinco',
  'marinaca',
  'arroyog',
  'camarillo',
  'chulavista',
  'bellflower',
  'ca_sm_county',
  'ourmaps',
];

const templates = {
  ndc: {
    countyWelcome: (place, districts, eventCode, moreInfo) => `<p>Welcome to the Districtr Community of Interest public mapping tool for ${place}’s 2021 ${districts}.<p>
       <p>As part of the redistricting process, the California FAIR MAPS Act includes
       neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a
       population that shares common social or economic interests that should
       be included within a single district for purposes of its effective and fair
       representation.”</p>
       <p>To let the County know about your community and what brings it together,
 share your map and your story using this tool now.</p>
       <p><strong>To display your map on this page, be sure the tag &quot;${eventCode}&quot; is filled
 out after you've clicked &quot;Save&quot; to share the map.</strong></p>
      ${moreInfo || ''}`,

    cityWelcome: (place, districts, eventCode) => `<p>Welcome to the Districtr Community of Interest public mapping tool for ${place}'s 2021 ${districts}.<p>
         <p>As part of the redistricting process, the California FAIR MAPS Act includes
         neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a
         population that shares common social or economic interests that should
         be included within a single district for purposes of its effective and fair
         representation.”</p>
         <p>To let the City know about your community and what brings it together,
      share your map and your story using this tool now.</p>
         <p><strong>To display your map on this page, be sure the tag &quot;${eventCode}&quot; is filled
      out after you've clicked &quot;Save&quot; to share the map.</strong></p>`,

    countyLongAbout: (name, count, moreInfo) => [
        `${name} County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the ${count} districts as equal in population as possible and that each member represents about the same number of constituents.
        The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full ${count}-district map suggestions for the whole county.
        ${moreInfo || ''}`,
        `This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks.
        The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.`
      ],
    cityLongAbout: (name, count, moreInfo) => [
      `${name} City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the ${count} districts as equal in population as possible and that each member represents about the same number of constituents.
      The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full ${count}-district map suggestions for the whole county.
      ${moreInfo || ''}`,
      `This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks.
      The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.`,
    ],
  },
  repa: {
    welcomeCity: (place, people, districts, eventCode, moreInfo) => `<p>Every 10 years, ${people} get the chance to help reshape their ${districts} following the decennial U.S. Census. It’s important to know about the communities of ${place} so that the district lines can amplify the voices of residents.</p>
       <p>Examples of communities can include homeowner associations (HOAs) or registered neighborhoods,  areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part of ${place} where people have a common interest that needs a voice in government.</p>
       <p><strong>${place}, we need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>
       ${moreInfo || ''}
       <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “${eventCode}” (any capitalization) is entered.</p>`,
    welcomeCounty: (place, people, districts, eventCode) => `<p>Every 10 years, ${people} get the chance to help reshape the ${place} ${districts} based on current United States Census data.
      Redistricting is based on population and communities of interest.  A community of interest shares common social and economic interests that should be included within a single supervisor district to achieve effective and fair representation for its residents.</p>
      <p>Examples of communities can include neighborhoods, areas where many residents speak the same language, areas using the same community facilities such as schools, transportation and public services.  It’s basically any geographic area where people have a common interest that needs a voice in government.</p>
      <p>We need your help to describe communities of interest.  Please use this tool to map the boundaries of your community and share your thoughts on what makes it a community of interest.
      Every map submitted will be carefully reviewed by the team charged with redrawing Supervisor District Maps.</p>
      <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “${eventCode}” (any capitalization) is entered.</p>`,
    longAbout: [
      "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
    ]
  }
};

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
  fyi: 'this is a test of the event descriptions',
  'unca-forsyth': 'Welcome to your class page UNC Asheville students! We\'re excited for you to start exploring Forsyth County with Districtr. <a href="/guide">Click here</a> for a tutorial.',
  buncombe: 'Welcome to the event page for Buncombe County!',
  'common cause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'commoncause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-md-ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-nm-abq': 'Welcome to the event page for the Common Cause New Mexico project!',
  centralsan: 'Welcome to the event page for the Central Contra Costa County Sanitary District. This page uses Districtr, a community web tool provided by the MGGG Redistricting Lab. <a href="/guide">Click here</a> for a Districtr tutorial.',
  'mggg-nm': 'Welcome to the event page for the MGGG - New Mexico demo!',
  'pmc-demo': 'Welcome to the COI collection page for Wisconsin (DEMO)',
  pmc: "<p>Welcome to the Community of Interest public mapping page for the People’s Maps Commission (PMC) of Wisconsin. The Commission is a group of people that will hear directly from folks across the state and draw fair, impartial maps for the Legislature to take up in 2021. Click <a href='https://govstatus.egov.com/peoplesmaps' target='_blank'>here</a> to learn more about their work.</p>\
  <p>As part of the redistricting process, the Commission will consider Communities of Interest, or COIs, groups with shared interests that should be given special consideration. To let the Commission know where communities are and what common concerns bind them together, share your map on this mapping page or submit your map through the Commission’s public submission portal <a href='https://govstatus.egov.com/peoplesmaps/contact-commission' target='_blank'>here</a>.</p>\
  <p><b>To display your map on this page, be sure the tag \"PMC\" is filled out after you've clicked \"Save\" to share the map.</b></p>",
  'pmc-districts': "<p>Welcome to the District-Drawing public mapping tag page for the People’s Maps Commission (PMC) of Wisconsin. The Commission is a group of people that will hear directly from folks across the state and draw fair, impartial maps for the Legislature to take up in 2021. Click <a href='https://govstatus.egov.com/peoplesmaps' target='_blank'>here</a> to learn more about their work.</p>\
  <p><b>To display your map on this page, be sure the tag \ “PMC-districts\” is filled out after you’ve clicked \ “Save\” to share the map.</b></p>",
  powercoalition: 'Welcome to the greater Baton Rouge event page for the <a href="https://powercoalition.org/">Power Coalition</a>. This page is set up to let you identify your communities of interest.<br/><br/>Show us the important places and tell us the stories that you want the mapmakers to see when they draw the lines!',
  'open-maps': "<p>Welcome to the public mapping page for OPEN Maps!</p>\
  <p>OPEN Maps (“Ohio Public Engagement in Neighborhoods” mapping project) is a joint project between the MGGG Redistricting Lab at the Tisch College of Civic Life and the Ohio State University’s Kirwan Institute for the Study of Race and Ethnicity.</p>\
  <p>Our goal is to <strong>collect over 500 community maps and narratives</strong>. Our team will synthesize these maps in a final report that we will submit to Ohio's politician redistricting commission.</p>\
  <p>Ohio residents, you can participate by drawing and describing Ohio communities in one of our modules. When you click “Save” to share your map, <strong>enter the tag “OPEN-maps”</strong> to post your map on this public submission page!</p>\
  <p>Visit our <a href='https://districtr.org/training' target='_blank'>training resources</a> page to learn more about Communities of Interest and prompts that you can answer to describe your community. Join one of our Districtr train-the-trainers to learn more about why communities matter and how to collect useful narratives.</p>",
  'fair-districts-oh': 'Welcome to the event page for Fair Districts Ohio!',
  'colorado-cc': 'Welcome to the event page for Colorado Common Cause!',
  ttt: 'Training the Trainers',
  nsfm: "<p>Welcome to the <a href='https://northshorefairmaps.com' target='_blank'>North Shore Fair Maps</a> mapping page. You can help Wisconsin’s <a href='https://govstatus.egov.com/peoplesmaps' target='_blank'>People’s Maps Commission</a> #EndGerrymandering! Please draw a map that shows us your “<a href='https://docs.google.com/document/d/15CFn85psZkJvGfgZeQwRGS6BMF1YJgEsTblZuwaBhzg/edit' target='_blank'>community of interest</a>.” Your map will tell the Commission what's on the ground and relevant. Your map will be added to thousands of other maps, computers will do their magic, and before you know it, new Wisconsin voting maps will be created. With so many people involved in map-making, there is no guaranty that YOUR map will rule the day, but it will be considered. It will count. And because of you and others like you, Wisconsin's new voting maps will make sure that everyone’s vote gets counted … and counts. Learn more about how you can help #EndGerrymandering at <a href='http://www.northshorefairmaps.com' target='_blank'>www.NorthShoreFairMaps.com</a>.</p>",
  'towsonu-baltimore': 'Welcome to the event page for Towson University',
  fairmapstexas: 'Welcome to the event page for Fair Maps Texas!',
  'missouri-mapping': "<p>You can help us map Missouri! When you click “Save” to share your map, <strong>enter the tag “missouri-mapping”</strong> to post your map on this public submission page. You can also enter it along with written comments at <a href='https://research.typeform.com/to/zH14rNfF' target='_blank'>our portal</a>.</p>",
  'ourmapsmn': "<p>Welcome to the Our Maps Minnesota Redistricting Campaign Mapping page! The Our Maps MN Campaign is committed to a community-focused, accessible, and transparent redistricting process in Minnesota. Through this campaign we aim to:</p>\
   <ul><li>Empower historically under-represented BIPOC communities and other stakeholders across the state to engage in the redistricting process to ensure they are seen and visible in our political boundaries, increasing their ability to elect officials that truly represent and listen to the community; and</li>\
   <li>Achieve fair Congressional and state legislative district maps that reflect input from communities of interest, particularly BIPOC communities</li></ul>\
   <p>As part of this we work to empower historically under-represented BIPOC communities and other stakeholders across Minnesota to participate in the redistricting process to ensure they are seen and visible in our political boundaries, increasing their ability to elect officials that truly represent and listen to the community.</p>\
   <p>A community-focused, accessible, and transparent redistricting process is critical to ensuring that our communities have equitable representation and influence in our democracy so we too can thrive. This page is both the starting point and the home for creation of community maps developed through the Our Maps Minnesota Campaign. Through this campaign we work with communities to define themselves through the connections, issues and policies that are most important to them, and then enable them to create maps showing their communities for inclusion in our political maps.</p>",
   'micrc': "Welcome to the public mapping page for the Michigan Independent Citizen's Redistricting Commission!",

   ourmapsne: "Welcome to the event page for Nebraska!",
    prjusd: "<p>Welcome to the public mapping page for the Paso Robles Joint Unified School District (“PRJUSD”) Board of Education. PRJUSD is transitioning from at-large elections to by-area elections to be implemented for the November 2022 election.  In by-area elections, PRJUSD will consist of 7 voting areas that are roughly equal in population.  Board members will be elected from each of the seven areas only by voters who reside within the respective areas.  Board members will be required to reside within the area from which they are elected.  For example, Area A’s representative on the PRJUSD Board will need to reside within Area A and is only elected by voters who reside within  Area A.</p>\
    <p>As part of the creation of voting areas, PRJUSD is seeking public input on what these voting areas should look like.  To let the School District know what you think the maps should look like, you can create your own map utilizing this website or you can take one of the previously created maps and modify it. \
    <a href='https://districtr.org/guide' target='_blank'>Click here</a> for a tutorial.</p>\
    <p><strong>To display your map on this page, be sure the tag \"PRJUSD\" is filled out after you've clicked \"Save\" to share the map.</strong></p>",
   hia: "Welcome to the event page for Houston in Action!",
   onelovemi: "<p>Welcome to the event page for One Love Michigan! Here is a message from the organization:</p>\
                <p>We know that historically, maps have been used as a tool for racism and white supremacy, between taking land from indigenous people to redlining and racial gerrymandering, so this is a moment to reclaim maps for empowerment. We need YOU to get involved!!! Join One Love Global in drawing maps of your community to ensure that they are kept intact during the redistricting process.</p>",
  'ks-fairmaps': 'Welcome to the event page for Fair Maps Kansas!',

   saccounty: templates.ndc.countyWelcome("Sacramento County", "supervisorial redistricting", "SacCounty",
              "<p>To learn more about the County’s redistricting effort, visit <a href='https://www.saccounty.net' target='_blank'>www.saccounty.net</a>.</p>"),
    saccountymap: templates.ndc.countyWelcome("Sacramento County", "supervisorial redistricting", "SacCountyMap",
             "<p>To learn more about the County’s redistricting effort, visit <a href='https://www.saccounty.net' target='_blank'>www.saccounty.net</a>.</p>"),
    fresno: templates.ndc.countyWelcome("Fresno County", "supervisorial redistricting", "Fresno"),
    nevadaco: templates.ndc.countyWelcome("Nevada County", "supervisorial redistricting", "NevadaCo"),
    sanmateoco: templates.ndc.countyWelcome("San Mateo County", "supervisorial redistricting", "SanMateoCo"),
    sanbenito: templates.ndc.countyWelcome("San Benito County", "supervisorial redistricting", "SanBenito"),
    sonomaco: templates.ndc.countyWelcome("Sonoma County", "supervisorial redistricting", "SonomaCo"),
    marinco: templates.ndc.countyWelcome("Marin County", "supervisorial redistricting", "MarinCo"),
    sbcounty: templates.ndc.countyWelcome("Santa Barbara County", "supervisorial redistricting", "SBCounty"),
    kingsco: templates.ndc.countyWelcome("Kings County", "supervisorial redistricting", "KingsCO"),
    mercedco: templates.ndc.countyWelcome("Merced County", "supervisorial redistricting", "MercedCo"),

    pasadena2021: templates.ndc.cityWelcome("Pasadena", "city council redistricting", "Pasadena2021"),
    marinaca: templates.ndc.cityWelcome("Marina", "city council redistricting", "MarinaCA"),
    fresnocity: templates.ndc.cityWelcome("Fresno", "city council redistricting", "FresnoCity"),
    arroyog: templates.ndc.cityWelcome("Arroyo Grande", "city council redistricting", "ArroyoG"),
    chulavista: templates.ndc.cityWelcome("Chula Vista", "city council redistricting", "ChulaVista"),
    camarillo: templates.ndc.cityWelcome("Camarillo", "city council redistricting", "Camarillo"),
    bellflower: templates.ndc.cityWelcome("Bellflower", "city council redistricting", "Bellflower"),
    goleta: templates.ndc.cityWelcome("Goleta", "city council redistricting", "Goleta"),

  san_jose: templates.repa.welcomeCity('San Jose', 'Californians', 'City Council districts', 'San_Jose'),
  redwood: templates.repa.welcomeCity('Redwood', 'Californians', 'City Council districts', 'Redwood'),
  mesaaz: templates.repa.welcomeCity('Mesa', 'Mesans', 'City Council districts', 'MesaAZ',
     "<p>Every map submitted will be carefully reviewed by the Mesa residents charged with redrawing the Mesa City Council District Map. For more information, visit <a href='https://www.mesaaz.gov/government/advisory-boards-committees/redistricting-commission' target='_blank'>Mesa’s Citizen Redistricting Commission</a>.</p>"),

  slo_county: templates.repa.welcomeCounty('San Luis Obispo', 'Californians', 'Supervisor Board districts', 'SLO_County',
     "<p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map. For more information, visit <a href='https://www.slocounty.ca.gov/redistricting' target='_blank'>this link</a>.</p>"),
  napa_county: templates.repa.welcomeCounty('Napa County', 'Californians', 'Supervisor Board districts', 'Napa_County'),
  siskiyou: templates.repa.welcomeCounty('Siskiyou County', 'Californians', 'Supervisor Board districts', 'Siskiyou'),
  ventura_county: templates.repa.welcomeCounty('Ventura County', 'Californians', 'Supervisor Board districts', 'Ventura_County'),
  yolo_county: templates.repa.welcomeCounty('Yolo County', 'Californians', 'Supervisor Board districts', 'Yolo_County'),
  solano_county: templates.repa.welcomeCounty('Solano County', 'Californians', 'Supervisor Board districts', 'Solano_County'),

  galeo: 'Welcome to the event page for GALEO!',
  ourmaps: 'Welcome to the event page for OurMaps!',
  commoncausepa: "<p>Welcome to the Community Mapping page managed by Common Cause PA.<p>\
  <p>This is a space where maps created by Communities of Interest (COI) are held until the COI determines what will be done with that map \
  (i.e. unity map, independent submission, regional maps). Common Cause will be working with organizations, groups and communities across the \
  state to collect a critical mass of community maps. These maps, whether as a part of a larger unity map or as independent maps, will be submitted \
  to the Legislative Reapportionment Commission (LRC) to consider as they draft the state legislative districts map.</p>\
  <p>If you have any questions or concerns please contact us <a href='https://docs.google.com/forms/d/e/1FAIpQLScJWWV1GYowgwXwcw6TEk_RmS_7I_3PMuG2ag-jIx0t8D73pg/viewform' target='_blank'>here</a>.</p>"
};

const longAbout = {
  'cc-nm-abq': ["MGGG has partnered with Common Cause, a nonprofit good-government organization championing voting rights and redistricting reform, to collect Communities of Interest in Albuquerque, New Mexico. Participants in Albuquerque will join the event virtually to engage in a discussion about community led by National Redistricting Manager, Dan Vicuña, and Census and Mass Incarceration Project Manager, Keshia Morris.",
      "The team will use Districtr, a free webtool developed by MGGG at Tufts University, to map important places and community boundaries. The data for this event were obtained from the US Census Bureau. The block group shapefiles were downloaded from the Census's TIGER/Line Shapefiles, and demographic information from the 2010 Decennial Census was downloaded at the block level from the Census API.",
      "We welcome questions and inquiries about the tool and our work. Reach out to us at <a href=\"mailto:contact@mggg.org\">contact@mggg.org</a> if you are interested in working with us."],
  centralsan: [
    "The <a href='https://www.centralsan.org/'>Central Contra Costa Sanitary District</a> (Central San) is transitioning from an at-large election system to an area-based election system. Under the current at-large election system, all five members of the Board of Directors are chosen by constituents from the District’s entire service area. Under area-based elections, the District will be divided into five separate election areas—called “divisions”—and voters residing in each area will select one representative to serve on the Board.",
    "Central San invites all residents of the District to provide input on the options under consideration, and to submit their own maps for consideration."],
  mesaaz: templates.repa.longAbout,
  slo_county: templates.repa.longAbout,
  napa_county: templates.repa.longAbout,
  san_jose: templates.repa.longAbout,
  siskiyou: templates.repa.longAbout,
  redwood: templates.repa.longAbout,
  ventura_county: templates.repa.longAbout,
  yolo_county: templates.repa.longAbout,
  solano_county: templates.repa.longAbout,
  prjusd: [
    "This mapping module displays 2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by <a href='https://www.coopstrategies.com' target='_blank'>Cooperative Strategies</a>. Cooperative Strategies is a comprehensive planning and demographics firm that has been retained by the School District to assist in its transition from at-large to by-area elections. Over the last decade, Cooperative Strategies has assisted more than 50 school districts across California draw their voting areas.",
  ],
  saccounty: templates.ndc.countyLongAbout('Sacramento', 'five', "For more information, please visit <a href='https://www.saccounty.net/Redistricting/' target='_blank'>www.saccounty.net/Redistricting/</a>"),
  saccountymap: templates.ndc.countyLongAbout('Sacramento', 'five', "For more information, please visit <a href='https://www.saccounty.net/Redistricting/' target='_blank'>www.saccounty.net/Redistricting/</a>"),
  sonomaco: templates.ndc.countyLongAbout('Sonoma', 'five'),
  marinco: templates.ndc.countyLongAbout('Marin', 'five'),
  mercedco: templates.ndc.countyLongAbout('Merced', 'five'),
  kingsco: templates.ndc.countyLongAbout('Kings', 'five'),
  fresno: templates.ndc.countyLongAbout('Fresno', 'five'),
  nevadaco: templates.ndc.countyLongAbout('Nevada', 'five'),
  sanmateoco: templates.ndc.countyLongAbout('San Mateo', 'five'),
  sanbenito: templates.ndc.countyLongAbout('San Benito', 'five'),
  sbcounty: templates.ndc.countyLongAbout('Santa Barbara', 'five'),
  pasadena2021: templates.ndc.cityLongAbout('City of Pasadena', 'seven'),
  goleta: templates.ndc.cityLongAbout('City of Goleta', 'four'),
  marinaca: templates.ndc.cityLongAbout('City of Marina', 'four'),
  arroyog: templates.ndc.cityLongAbout('Arroyo Grande', 'four'),
  camarillo: templates.ndc.cityLongAbout('Camarillo', 'five'),
  bellflower: templates.ndc.cityLongAbout('Bellflower', 'five'),
  chulavista: templates.ndc.cityLongAbout('Chula Vista', 'four'),
  commoncausepa: [
    "Common Cause Pennsylvania is the defender of citizens’ rights in the halls of power and in our communities.\
     Standing as an independent voice for positive change, a watchdog against corruption, and protector against abuse of power, \
     we work to hold public officials accountable and responsive to citizens. Common Cause Pennsylvania is a nonpartisan, good government organization."
  ],
};

module.exports = {
  stateForEvent,
  validEventCodes,
  coi_events,
  hybrid_events,
  eventDescriptions,
  longAbout,
}
