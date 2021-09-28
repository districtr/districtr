import { svg, html, render } from "lit-html";
import { communitiesFilter, listPlacesForState, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";
import { PlaceMapWithData } from "../components/PlaceMap";
import { geoPath } from "d3-geo";
import { geoAlbersUsaTerritories } from "geo-albers-usa-territories";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";


// start draftskip at -8 so that we hide the drafts on initial load
let skip = 0, draftskip = -8,
    prevPlans = [],
    prevDrafts = [];

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
  sunnyvale2021: 'California',
  laverne: 'California',
  pomonaca: 'California',
  richmondca: 'California',
  elcajon: 'California',
  carlsbad2021: 'California',
  encinitas2021: 'California',
  bp2021: 'California',
  hmb2021: 'California',
  stockton2021: 'California',
  lodi2021: 'California',
  glendale2021: 'Arizona',
  goleta: 'California',
  sbcounty: 'California',
  'ks-fairmaps': 'Kansas',
  napa_county: 'California',
san_jose: 'California',
siskiyou: 'California',
redwood_city: 'California',
cityofdallas: 'Texas',
city_of_napa: 'California',
napa_boe: 'California',
napa_college: 'California',
tuolumne: 'California',
mapsofla: 'California',
kern_county: 'California',
san_joaquin: 'California',
san_mateo_city: 'California',
santa_clara_county: 'California',
butte_county: 'California',
humboldt_county: 'California',
santa_clara_water: 'California',
oakland: 'California',
martinez: 'California',
carpinteria: 'California',
ventura_county: 'California',
yolo_county: 'California',
solano_county: 'California',
imperial_county: 'California',
ojai: 'California',
foothilldeanza: 'California',
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
  lakee: 'California',
  chino2021: 'California',
  fremont2021: 'California',
  campbellcity: 'California',
  buellton: 'California',
  ocsd: 'California',
  groverbeach: 'California',
  vallejo: 'California',
  long_beach: 'California',
  santa_clara_county: 'California',
  'ft-myers': 'Florida',
  'mp-maps': 'California',
  keystonecounts: 'Pennsylvania',
  pavoice: 'Pennsylvania',
  sandiego: 'California',
  yumasup: 'Arizona',
  yumaawc: 'Arizona',
  santa_ana: 'California',
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
  sunnyvale2021: 'sunnyvale',
  laverne: 'laverne',
  pomonaca: 'pomona',
  richmondca: 'ca_richmond',
  elcajon: 'elcajon',
  carlsbad2021: 'ca_carlsbad',
  encinitas2021: 'encinitas',
  bp2021: 'buenapark',
  hmb2021: 'halfmoon',
  stockton2021: 'ca_stockton',
  lodi2021: 'lodi',
  glendale2021: 'glendaleaz',
  sonomaco: 'ca_sonoma',
  'ks-fairmaps': 'kansas',
  napa_county: 'napacounty2021',
  san_jose: 'sanjoseca',
  siskiyou: 'ca_siskiyou',
  redwood_city: 'redwood',
  cityofdallas: 'dallastx',
  city_of_napa: 'napa2021',
  long_beach: 'longbeach',
napa_boe: 'napa_boe',
napa_college: 'napa_college',
tuolumne: 'ca_tuolumne',
mapsofla: 'rp_lax',
kern_county: 'ca_kern',
san_joaquin: 'ca_sanjoaquin',
san_mateo_city: 'ca_sanmateo',
oakland: 'ca_oakland',
martinez: 'ca_martinez',
carpinteria: 'carpinteria',
santa_clara_county: 'ca_sc_county',
butte_county: 'ca_butte',
humboldt_county: 'ca_humboldt',
santa_clara_water: 'santa_clara_h2o',
  ventura_county: 'ca_ventura',
  yolo_county: 'ca_yolo',
  solano_county: 'ca_solano',
  imperial_county: 'ca_imperial',
  ojai: 'ojai',
  foothilldeanza: 'ca_foothill',
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
  lakee: 'lake_el',
  chino2021: 'ca_chino',
  fremont2021: 'ca_fremont',
  campbellcity: 'ca_campbell',
  buellton: 'ca_buellton',
  ocsd: 'ca_oceano',
  groverbeach: 'ca_grover',
  vallejo: 'ca_vallejo',
  santa_clara_county: 'ca_sc_county',
  'ft-myers': 'ftmyers',
  'mp-maps': 'menlo_park',
  keystonecounts: 'pennsylvania',
  pavoice: 'pennsylvania',
  sandiego: 'ca_SanDiego',
  yumasup: 'yuma',
  yumaawc: 'yuma_awc',
  santa_ana: 'ca_santa_ana',
};

const blockPlans = {
  powercoalition: [9439, 9446],
};

const unitTypes = {
  "pmc-demo": {no: '2011 Wards'},
  pmc: {no: '2011 Wards'},
  'pmc-districts': {no: ['2011 Wards', 'Block Groups']},
  powercoalition: {no: 'Precincts'},
  "open-maps": {no: 'Precincts'},
  "fair-districts-oh": {no: 'Precincts'},
  grns: {no: '2011 Wards'},
  'missouri-mapping': {no: 'Precincts'},
  'hia': {no: 'Precincts'},
  mesaaz: {no: 'Blocks'},
  city_of_napa: {no: 'Blocks'},
  napa_county: {no: 'Blocks'},
  san_mateo_city: {no: 'Blocks'},
  napa_boe: {no: 'Blocks'},
  napa_college: {no: 'Blocks'},
  santa_clara_county: {no: 'Blocks'},
  san_jose: {no: 'Blocks'},
  san_joaquin: {no: 'Blocks'},
  oakland: {no: 'Blocks'},
  kern_county: {no: 'Blocks'},
  humboldt_county: {no: 'Blocks'},
  ventura_county: {no: 'Blocks'},
  redwood_city: {no: 'Blocks'},
  'mp-maps': {no: 'Blocks'},
  yumasup: {no: 'Blocks'},
  keystonecounts: {no: ['VTDs', 'Precincts', 'Block Groups']},
  pavoice: {no: ['VTDs', 'Precincts', 'Block Groups']},
};

const unitCounts = {
  'unca-forsyth': 101,
  centralsan: 5086,
  buncombe: 67,
  'towsonu-baltimore': 653,
  prjusd: 2818,
  'pmc-districts':7078
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
  'slo_county',
  'ourmapsne',
  'onelovemi',
  'ks-fairmaps',
  'siskiyou',
  'yolo_county',
  'solano_county',
  'commoncausepa',
  'tuolumne',
  'martinez',
  'carpinteria',
  'santa_clara_water',
  'pasadena2021',
];

const hybrid_events = [
  'santa_ana',
  'humboldt_county',
  'ventura_county',
  'san_mateo_city',
  'kern_county',
  'redwood_city',
  'cityofdallas',
  'mesaaz',
  'sandiego',
  'yumasup',
  'yumaawc',
  'hia',
  'oakland',
  'long_beach',
  'santa_clara_county',
  'san_jose',
  'san_joaquin',
  'saccounty',
  'napa_boe',
  'napa_college',
  'city_of_napa',
  'napa_county',
  'imperial_county',
  'ojai',
  'foothilldeanza',
  'saccountymap',
  'fresno',
  'fresnocity',
  'nevadaco',
  'sanmateoco',
  'sanbenito',
  'sonomaco',
  'sunnyvale2021',
  'laverne',
  'pomonaca',
  'richmondca',
  'elcajon',
  'carlsbad2021',
  'encinitas2021',
  'bp2021',
  'hmb2021',
  'stockton2021',
  'lodi2021',
  'glendale2021',
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
  'lakee',
  'chino2021',
  'fremont2021',
  'campbellcity',
  'buellton',
  'ocsd',
  'groverbeach',
  'vallejo',
  'ft-myers',
  'mp-maps',
  'mapsofla',
  'butte_county',
];

const portal_events = [
  'open-maps',
  'fyi',
];

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
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
  'pmc-districts': "<p>Welcome to the PMC-Districts event page for the People’s Maps Commission (PMC) of Wisconsin. The Commission is a group of people that will hear directly from folks across the state and draw fair, impartial maps for the Legislature to take up in 2021. Click <a href='https://govstatus.egov.com/peoplesmaps' target='_blank'>here</a> to learn more about their work.</p>\
  <p><b>The purpose of this page is to show some sample maps that have been generated in the preliminary work of the PMC.  These are part of the Commission's process as they work towards draft maps that take the districting criteria into account.  These will later be combined with \"communities of interest\" input gathered from the <a href='https://portal.wisconsin-mapping.org' target='_blank'>PMC Public Feedback Portal</a>, as well as updated demographic data from the 2020 Census, to produce proposed maps.</b></p>",
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
   mesaaz: "<p>Every 10 years, Mesans get the chance to help reshape their City Council districts following the decennial U.S. Census. It’s important to know about the communities of Mesa so that the district lines can amplify the voices of residents.</p>\
      <p>Examples of communities can include homeowner associations (HOAs) or registered neighborhoods,  areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part of Mesa where people have a common interest that needs a voice in government.</p>\
      <p><strong>Mesa, we need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
      <p>Every map submitted will be carefully reviewed by the Mesa residents charged with redrawing the Mesa City Council District Map. For more information, visit <a href='https://www.mesaaz.gov/government/advisory-boards-committees/redistricting-commission' target='_blank'>Mesa’s Citizen Redistricting Commission</a>.</p>\
      <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “MesaAZ” (any capitalization) is entered.</p>",
    slo_county: "<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
       <p>Examples of communities can include homeowner associations (HOAs) or registered neighborhoods,  areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
       <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
       <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map. For more information, visit <a href='https://www.slocounty.ca.gov/redistricting' target='_blank'>this link</a>.</p>\
       <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “SLO_County” (any capitalization) is entered.</p>",
   ourmapsne: "Welcome to the event page for Nebraska!",
    prjusd: "<p>Welcome to the public mapping page for the Paso Robles Joint Unified School District (“PRJUSD”) Board of Education. PRJUSD is transitioning from at-large elections to by-area elections to be implemented for the November 2022 election.  In by-area elections, PRJUSD will consist of 7 voting areas that are roughly equal in population.  Board members will be elected from each of the seven areas only by voters who reside within the respective areas.  Board members will be required to reside within the area from which they are elected.  For example, Area A’s representative on the PRJUSD Board will need to reside within Area A and is only elected by voters who reside within  Area A.</p>\
    <p>As part of the creation of voting areas, PRJUSD is seeking public input on what these voting areas should look like.  To let the School District know what you think the maps should look like, you can create your own map utilizing this website or you can take one of the previously created maps and modify it. \
    <a href='https://districtr.org/guide' target='_blank'>Click here</a> for a tutorial.</p>\
    <p><strong>To display your map on this page, be sure the tag \"PRJUSD\" is filled out after you've clicked \"Save\" to share the map.</strong></p>",
   hia: "Welcome to the event page for Houston in Action!",
   onelovemi: "<p>Welcome to the event page for One Love Michigan! Here is a message from the organization:</p>\
                <p>We know that historically, maps have been used as a tool for racism and white supremacy, between taking land from indigenous people to redlining and racial gerrymandering, so this is a moment to reclaim maps for empowerment. We need YOU to get involved!!! Join One Love Global in drawing maps of your community to ensure that they are kept intact during the redistricting process.</p>",
   saccounty: "<p>Welcome to the Districtr Community of Interest public mapping tool for Sacramento County’s 2021 supervisorial redistricting.<p>\
      <p>As part of the redistricting process, the California FAIR MAPS Act includes \
      neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
      population that shares common social or economic interests that should \
      be included within a single district for purposes of its effective and fair \
      representation.”</p>\
      <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
      <p><strong>To display your map on this page, be sure the tag &quot;SacCounty&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>\
<p>To learn more about the County’s redistricting effort, visit \
  <a href='https://www.saccounty.net' target='_blank'>www.saccounty.net</a>.</p>",
  fresno: "<p>Welcome to the Districtr Community of Interest public mapping tool for Fresno County’s 2021 supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Fresno&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
nevadaco: "<p>Welcome to the Districtr Community of Interest public mapping tool for Nevada County’s 2021 supervisorial redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;NevadaCo&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
sanmateoco: "<p>Welcome to the Districtr Community of Interest public mapping tool for San Mateo County’s 2021 supervisorial redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;SanMateoCo&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
sanbenito: "<p>Welcome to the Districtr Community of Interest public mapping tool for San Benito County’s 2021 supervisorial redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;SanBenito&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  sonomaco: "<p>Welcome to the Districtr Community of Interest public mapping tool for Sonoma County’s 2021 supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;SonomaCo&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
pasadena2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Pasadena's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Pasadena2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",

sunnyvale2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Sunnyvale's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Sunnyvale2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
laverne: "<p>Welcome to the Districtr Community of Interest public mapping tool for La Verne's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;LaVerne&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
pomonaca: "<p>Welcome to the Districtr Community of Interest public mapping tool for Ponoma's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;PonomaCA&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
richmondca: "<p>Welcome to the Districtr Community of Interest public mapping tool for Richmond's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;RichmondCA&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
elcajon: "<p>Welcome to the Districtr Community of Interest public mapping tool for El Cajon's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;ElCajon&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
carlsbad2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Carlsbad's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Carlsbad2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
encinitas2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Encinitas's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Encinitas2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
bp2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Buena Park's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;BP2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
hmb2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Half Moon Bay's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;HMB2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
stockton2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Stockton's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Stockton2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
lodi2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Lodi's 2021 city council redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Lodi2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
glendale2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Glendale's 2021 city council redistricting.<p>\
   <p>To let the City know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;Glendale2021&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
marinco: "<p>Welcome to the Districtr Community of Interest public mapping tool for Marin County's 2021 supervisorial redistricting.<p>\
   <p>As part of the redistricting process, the California FAIR MAPS Act includes \
   neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
   population that shares common social or economic interests that should \
   be included within a single district for purposes of its effective and fair \
   representation.”</p>\
   <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
   <p><strong>To display your map on this page, be sure the tag &quot;MarinCo&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  saccountymap: "<p>Welcome to the Districtr Community of Interest public mapping tool for Sacramento County’s 2021 supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.</p>\
     <p>To let the County know about your community and what brings it together, \
share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;SacCounty&quot; is filled \
out after you've clicked &quot;Save&quot; to share the map.</strong></p>\
<p>To learn more about the County’s redistricting effort, visit \
 <a href='https://www.saccounty.net' target='_blank'>www.saccounty.net</a>.</p>",
  'ks-fairmaps': 'Welcome to the event page for Fair Maps Kansas!',
  long_beach: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted to the Long Beach Independent Redistricting Commission will be carefully reviewed and included as part of the public record. For more information, visit <a href="https://www.longbeach.gov/redistricting" target="_blank">this link</a>.</p>\
  <p>Get started by clicking the orange button to draw your community or the purple button to draw your city council map. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Long_Beach”.</p>\
  <p>For a detailed how-to guide of Districtr, visit our <a href="/guide" target="_blank">Guide page</a>.</p>',
  santa_ana: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Get started by clicking the orange button to draw your community or the purple button to draw your city council map. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Santa_Ana”.</p>\
  <p>For a detailed how-to guide of Districtr, visit our <a href="/guide" target="_blank">Guide page</a>.</p>',
  napa_county: '<p>Every 10 years, Californians get the chance to help reshape five Napa County Board of Supervisor districts based on current United States Census data.  Redistricting is based on population and communities of interest.  A community of interest shares common social and economic interests that should be included within a single supervisor district to achieve effective and fair representation for its residents.</p>\
  <p>Examples of communities can include neighborhoods, areas where many residents speak the same language, areas using the same community facilities such as schools, transportation and public services.  It’s basically any geographic area where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to describe communities of interest.  Please use this tool to map the boundaries of your community and share your thoughts on what makes it a community of interest. You can also draw your own district map.</strong></p>\
  <p>Every map submitted will be carefully reviewed by the team charged with redrawing Supervisor District Maps. For more information, visit <a href="http://www.countyofnapa.org/398/2021-Redistricting">this link</a>.</p>\
  <p>Get started by clicking the orange button to draw your community of interest. Click on the blue button to draw your district map of the county. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Napa_County” (any capitalization) is entered.”</p>',
  napa_boe: '<p>Every 10 years, Californians get the chance to help reshape the seven Napa County Board of Education districts based on current United States Census data. Redistricting is based on population and communities of interest. A community of interest shares common social and economic interests that should be included within a single supervisor district to achieve effective and fair representation for its residents.</p> \
    <p>Examples of communities can include neighborhoods, areas where many residents speak the same language, areas using the same community facilities such as schools, transportation and public services.  It’s basically any geographic area where people have a common interest that needs a voice in government.</p>\
    <p>We need your help to describe communities of interest.  Please use this tool to map the boundaries of your community and share your thoughts on what makes it a community of interest.\
    </p>\
    <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Napa_BOE” (any capitalization) is entered.</p>',
  napa_college: '<p>Every 10 years, Californians get the chance to help reshape the seven Napa Valley College Trustee districts based on current United States Census data. Redistricting is based on population and communities of interest. A community of interest shares common social and economic interests that should be included within a single trustee district to achieve effective and fair representation for its residents.</p> \
    <p>Examples of communities can include neighborhoods, areas where many residents speak the same language, areas using the same community facilities such as schools, transportation and public services.  It’s basically any geographic area where people have a common interest that needs a voice in government.</p>\
    <p>We need your help to describe communities of interest.  Please use this tool to map the boundaries of your community and share your thoughts on what makes it a community of interest.\
    </p>\
    <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Napa_College” (any capitalization) is entered.</p>',
  city_of_napa: '<p>Every 10 years, Californians get the chance to help reshape their City Council districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
  <p>Examples of communities can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community. If you would like to draw a full map, then please select the DISTRICT option to draw lines for four City Council districts.</strong></p>\
  <p>Every map submission will become a part of the public record and posted on the City’s website. Map submissions will be carefully reviewed by the City’s demographer and presented to the City Council for their consideration and approval of a final adopted map.</p>\
  <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag ”City_of_Napa” (any capitalization) is entered.</p>',
 san_jose: '<p>Every 10 years, Californians get the chance to help reshape their City Council districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
 <p>Examples of communities can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted will be carefully reviewed and included as part of the public record. For more information, \
  <a href="https://www.sanjoseca.gov/your-government/appointees/city-clerk/redistricting-2020">visit this link</a>.</p>\
  <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “San_Jose” (any capitalization) is entered.</p>',
 mapsofla: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
 <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
 <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
 <p>Every map submitted to the City Redistricting Commission will be carefully reviewed and included as part of the public record. For more information, visit <a href="https://laccrc2021.org" target="_blank">this link</a>.</p>\
 <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “MapsofLA”.\
 <br/>For a detailed how-to guide of Districtr, visit our <a href="/guide">Guide page</a>.</p><br/>',
  siskiyou: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
  <p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
  <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Siskiyou” (any capitalization) is entered.</p>',
  redwood_city: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities.  People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted to the City will be carefully reviewed and included as part of the public record. For more information, <a href="https://www.redwoodcity.org/departments/city-clerk/redistricting-process" target="_blank">visit this link</a>.<br/>\
  Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Redwood City”.</p>',
   ventura_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
      <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
      <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
      <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Ventura_County” (any capitalization) is entered.</p>',
   yolo_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
      <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
      <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
      <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Yolo_County” (any capitalization) is entered.</p>',
  tuolumne: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
  <p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
  <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Tuolumne” (any capitalization) is entered.</p>',
  kern_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
      <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
      <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map. For more information, <a href="https://www.kerncounty.com/government/2021-redistricting-menu" target="_blank">visit this link</a>.</p>\
      <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Kern_County” (any capitalization) is entered.</p>',
   san_joaquin: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
      <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
      <p>Every map submitted will be carefully reviewed by the San Joaquin County Redistricting Advisory Committee charged with redrawing and recommending the Supervisorial District Map. <a href="https://wedrawthelines.sjgov.org/" target="_blank">For more information, visit this link.</a></p>\
      <p>To draw your community click on the orange button. To draw a five district plan click on the purple button. To view demographic data on the map and add city boundaries, click on the “Data Layers” tab. After you have drawn your community, please provide a name for your community and provide a short description. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “San_Joaquin” (any capitalization) is entered.</p>',
  santa_clara_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
     <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
     <p>Community of Interest submissions completed from August through September will be presented to the 2021 Advisory Redistricting Commission to inform the mapping process, which will occur in October. To learn more about the Santa Clara County process, please visit the website at <a href="http://www.sccgov.org/2021redistricting">http://www.sccgov.org/2021redistricting</a>.</p>\
     <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Santa_Clara_County” (any capitalization) is entered.</p>',
 butte_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
    <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
    <p>Every map submitted will be carefully reviewed by those charged with redrawing the Supervisorial District Map.</p>\
    <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Butte_County” (any capitalization) is entered.</p>',
  humboldt_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
   <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
   <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
   <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Humboldt_County” (any capitalization) is entered.</p>',
  santa_clara_water: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
 <p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
        <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
        <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Santa_Clara_Water” (any capitalization) is entered.</p>',
  san_mateo_city: '<p>The City of San Mateo is in the process of moving from an at-large election system to a by-district election system. To draw these new districts we need to hear from you as it’s important to know about your community so that the district lines can amplify the voices of residents. Learn more on the <a href="https://www.cityofsanmateo.org/4537/District-Elections">Represent San Mateo web page</a>.</p>\
  <p>Examples of communities can include neighborhood associations, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted will be carefully reviewed by professional demographers and decision makers who are charged with drawing the City Council District Map.<br/>\
  Get started by clicking the orange button to draw your community of interest. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “San_Mateo_City” (any capitalization) is entered.</p>',

  oakland: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted to the Oakland Redistricting Commission will be carefully reviewed and included as part of the public record. For more information, visit <a href="https://www.oaklandca.gov/boards-commissions/redistricting-commission" target="_blank">this link</a>.</p>\
  <p>Get started by clicking the orange button to draw your community or the purple button to draw your city council map. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Oakland”.\
  <br/>For a detailed how-to guide of Districtr, visit our <a href="/guide">Guide page</a>.</p>',
  martinez: '<p>Every 10 years, Californians get the chance to help reshape their City Council districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
   <p>Examples of communities can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
    <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
    <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
    <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Martinez” (any capitalization) is entered.</p>',
  carpinteria: '<p>Every 10 years, Californians get the chance to help reshape their City Council districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
   <p>Examples of communities can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
    <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
    <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
    <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Carpinteria” (any capitalization) is entered.</p>',
  solano_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
       <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
       <p>Every map submitted will be carefully reviewed by the residents charged with redrawing the Supervisorial District Map.</p>\
       <p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Solano_County” (any capitalization) is entered.</p>',
  imperial_county: '<p>Every 10 years, Californians get the chance to help reshape their Supervisor Board districts following the decennial U.S. Census. It’s important to know about communities so that the district lines can amplify the voices of residents.</p>\
  <p>Examples of communities can include cities, neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part where people have a common interest that needs a voice in government.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community. You can also start drawing district plans.</strong></p>\
  <p>Every map submitted will be carefully reviewed by the Imperial County Redistricting Advisory Committee charged with redrawing and recommending the Supervisorial District Map.</p>\
  <p>To draw your community click on the orange button. To draw a five district plan click on the purple button. To view demographic data on the map and add city boundaries, click on the “Data Layers” tab. After you have drawn your community, please provide a name for your community and provide a short description. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Imperial_County” (any capitalization) is entered.</p>',
  ojai: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each City Councilmember represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Councilmember. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Every map submitted will be carefully reviewed and included as part of the public record. For more information visit <a href="https://ojai.ca.gov/redistricting/" target="_blank">this link</a>.</p>\
  <p>Get started by clicking the orange button to draw your community or the purple button to draw your city council map. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “Ojai”.</p>\
  <p>For a detailed how-to guide of Districtr, visit our <a href="/guide" target="_blank">Guide page</a>.</p>',
  foothilldeanza: '<p>Every ten years, local governments use new United States Census data to redraw their district lines to reflect how local populations have changed. This process, called redistricting, is important in ensuring that each Trustee represents about the same number of constituents. Redistricting also determines which neighborhoods and communities are grouped together into a district for purposes of electing a Trustee. In addition to Census data, officials conducting the redistricting process consider how to maintain communities of interest when redrawing district boundaries.</p>\
  <p>Examples of communities of interest can include neighborhood associations or planning zones, areas where many residents speak the same language, or even areas where the residents use the same community facilities. People who have common interests that need a voice in government define their own communities.</p>\
  <p><strong>We need your help to build a community map! Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
  <p>Get started by clicking the orange button to draw your community or the purple button to draw your map. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “FoothillDeAnza”.</p>\
  <p>For a detailed how-to guide of Districtr, visit our <a href="/guide" target="_blank">Guide page</a>.</p>',
  galeo: 'Welcome to the event page for GALEO!',
  marinaca: "<p>Welcome to the Districtr Community of Interest public mapping tool for Marina's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;MarinaCA&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  fresnocity: "<p>Welcome to the Districtr Community of Interest public mapping tool for Fresno's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;FresnoCity&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  arroyog: "<p>Welcome to the Districtr Community of Interest public mapping tool for Arroyo Grande's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;ArroyoG&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  chulavista: "<p>Welcome to the Districtr Community of Interest public mapping tool for Chula Vista's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;ChulaVista&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  camarillo: "<p>Welcome to the Districtr Community of Interest public mapping tool for Camarillo's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Camarillo&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  yumasup: "<p>Welcome to the Districtr Community of Interest public mapping tool for Yuma County's 2021 supervisorial redistricting.<p>\
     <p>To let the County know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;YumaSup&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  yumaawc: "<p>Welcome to the Districtr Community of Interest public mapping tool for Arizona Western College's 2021 trustee board redistricting.<p>\
     <p>To let the College know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;YumaAWC&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  bellflower: "<p>Welcome to the Districtr Community of Interest public mapping tool for Bellflower's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Bellflower&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  goleta: "<p>Welcome to the Districtr Community of Interest public mapping tool for Goleta's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Goleta&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  sbcounty: "<p>Welcome to the Districtr Community of Interest public mapping tool for Santa Barbara's 2021 county supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the County know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;SBCounty&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  kingsco: "<p>Welcome to the Districtr Community of Interest public mapping tool for Kings County's 2021 supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the County know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;KingsCO&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  mercedco: "<p>Welcome to the Districtr Community of Interest public mapping tool for Merced County's 2021 supervisorial redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the County know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;MercedCo&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  lakee: "<p>Welcome to the Districtr Community of Interest public mapping tool for Lake Elsinore's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;LakeE&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  chino2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Chino's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Chino2021&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  campbellcity: "<p>Welcome to the Districtr Community of Interest public mapping tool for Campbell's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;CampbellCity&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",

  ocsd: "<p>Welcome to the Districtr Community of Interest public mapping tool for Oceano Community Service District's 2021 division redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the CSD know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;OCSD&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  buellton: "<p>Welcome to the Districtr Community of Interest public mapping tool for Buellton's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Buellton&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  vallejo: "<p>Welcome to the Districtr Community of Interest public mapping tool for Vallejo's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Vallejo&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
  groverbeach: "<p>Welcome to the Districtr Community of Interest public mapping tool for Grover Beach's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
  share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;GroverBeach&quot; is filled \
  out after you've clicked &quot;Save&quot; to share the map.</strong></p>",

  fremont2021: "<p>Welcome to the Districtr Community of Interest public mapping tool for Fremont's 2021 city council redistricting.<p>\
     <p>As part of the redistricting process, the California FAIR MAPS Act includes \
     neighborhoods and “Communities of Interest” as important considerations. California law defines Communities of Interest as “a \
     population that shares common social or economic interests that should \
     be included within a single district for purposes of its effective and fair \
     representation.”</p>\
     <p>To let the City know about your community and what brings it together, \
     share your map and your story using this tool now.</p>\
     <p><strong>To display your map on this page, be sure the tag &quot;Fremont2021&quot; is filled \
     out after you've clicked &quot;Save&quot; to share the map.</strong></p>",
 'mp-maps': "<p>Welcome to the Districtr public mapping tool to support the City of Menlo Park's 2021 City Council redistricting effort.<p>\
     <p>As part of the City's effort to provide transparency and meet requirements of the California FAIR MAPS Act, we encourage residents to \
     submit their draft city council districts and “Communities of Interest” (COI) using the <a href='https://districtr.org/' target='_blank'>Districtr.org</a> mapping tool. A “Community of Interest” \
     is defined by California law as: “a population that shares common social or economic interests that should be included within a single district \
     for purposes of its effective and fair representation.”</p>\
     <p>Draft districts must be contiguous and maintain equal population size to ensure equal representation between districts.</p>\
     <p>Click the following link to view <a href='https://menlopark.maps.arcgis.com/apps/InformationLookup/index.html?appid=83d9c16b24d2493893fde31135490a7e' target='_blank'>Current Districts</a>.</p>",
  ourmaps: 'Welcome to the event page for OurMaps!',
  commoncausepa: "<p>Welcome to the Community Mapping page managed by Common Cause PA.<p>\
  <p>This is a space where maps created by Communities of Interest (COI) are held until the COI determines what will be done with that map \
  (i.e. unity map, independent submission, regional maps). Common Cause will be working with organizations, groups and communities across the \
  state to collect a critical mass of community maps. These maps, whether as a part of a larger unity map or as independent maps, will be submitted \
  to the Legislative Reapportionment Commission (LRC) to consider as they draft the state legislative districts map.</p>\
  <p>If you have any questions or concerns please contact us <a href='https://docs.google.com/forms/d/e/1FAIpQLScJWWV1GYowgwXwcw6TEk_RmS_7I_3PMuG2ag-jIx0t8D73pg/viewform' target='_blank'>here</a>.</p>",
  'ft-myers': "<p>Welcome to The City of Fort Myers Online Redistricting Project.<p>\
       <p>The City of Fort Myers is one of the fastest-growing cities in the nation. The population and demographic makeup of the City have changed substantially since the last redistricting in 2010.</p>\
       <p>Every decade, the City must re-draw the city wards to balance the population within the wards to distribute the representation on the City Council equally and fairly.</p>\
       <p>This online tool allows easy access to the United States Census's population data for redistricting, based on the 2020 decennial census. Users of this system can create and \
        save maps to better understand the process. Public transparency, communication, and participation are keys to a successful redistricting effort.</p>",
  cityofdallas: '<p>Every 10 years, the residents of the City of Dallas get the chance to help reshape their City Council districts following the decennial U.S. Census.</p>\
<p>Please take this opportunity to draw your own districts using the redistricting requirements as listed <a href="https://www.dallascityhall.com" target="_blank">here</a>.</p>\
<p>It’s important to know about the communities of interest so that the district lines can amplify the voices of residents.</p>\
<p>Examples of communities can include homeowner associations (HOAs) or registered neighborhoods, areas where many residents speak the same language, or even areas where the residents use the same community facilities. It’s basically any part of the City where people have a common interest that needs a voice in government.</p>\
<p><strong>Please use this tool to identify the boundaries of your community and share what makes it a community.</strong></p>\
<p>Every map submitted will be carefully reviewed by the City of Dallas Redistricting Commission. For more information, visit <a href="https://dallascityhall.com" target="_blank">City of Dallas Citizen Redistricting Commission</a>.</p>\
<p>Get started by clicking the orange button. To share your map, click “Save” in the upper right corner of the mapping module. To pin your map to this page, be sure the tag “CityofDallas” (any capitalization) is entered.</p>\
<p>As part of the redistricting process, the Commission will consider Communities of Interest, or COIs, groups with shared interests that should be given special consideration. To let the Commission, know where communities are and what common concerns bind them together, share your map on this mapping page or submit your map through the Commission’s public submission portal here.</p>',
};

const longAbout = {
  'cc-nm-abq': ["MGGG has partnered with Common Cause, a nonprofit good-government organization championing voting rights and redistricting reform, to collect Communities of Interest in Albuquerque, New Mexico. Participants in Albuquerque will join the event virtually to engage in a discussion about community led by National Redistricting Manager, Dan Vicuña, and Census and Mass Incarceration Project Manager, Keshia Morris.",
      "The team will use Districtr, a free webtool developed by MGGG at Tufts University, to map important places and community boundaries. The data for this event were obtained from the US Census Bureau. The block group shapefiles were downloaded from the Census's TIGER/Line Shapefiles, and demographic information from the 2010 Decennial Census was downloaded at the block level from the Census API.",
      "We welcome questions and inquiries about the tool and our work. Reach out to us at <a href=\"mailto:contact@mggg.org\">contact@mggg.org</a> if you are interested in working with us."],
  centralsan: [
    "The <a href='https://www.centralsan.org/'>Central Contra Costa Sanitary District</a> (Central San) is transitioning from an at-large election system to an area-based election system. Under the current at-large election system, all five members of the Board of Directors are chosen by constituents from the District’s entire service area. Under area-based elections, the District will be divided into five separate election areas—called “divisions”—and voters residing in each area will select one representative to serve on the Board.",
    "Central San invites all residents of the District to provide input on the options under consideration, and to submit their own maps for consideration."],
  mesaaz: [
    "This mapping module uses the <strong>2020 Decennial Census</strong> population with processing by Redistricting Partners. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  slo_county: [
    "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  long_beach: [
    "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  imperial_county: [
    "This mapping module displays the Legacy Format of the <strong>2020 Census Data</strong> released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 20, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>The data is prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  ojai: [
    "This mapping module displays the Legacy Format of the <strong>2020 Census Data</strong> released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 20, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>The data is prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  foothilldeanza: [
    "This mapping module displays the Legacy Format of the <strong>2020 Census Data</strong> released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 20, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>The data is prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  napa_county: [
    "This mapping module displays the Legacy Format of the 2020 Census Data released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 23, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>The data is prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  napa_college: [
   "This mapping module uses the <strong>2020 Decennial Census</strong> population with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 napa_boe: [
   "This mapping module uses the <strong>2020 Decennial Census</strong> population with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 tuolumne: [
   "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 city_of_napa: [
   "This mapping module displays the Legacy Format of the 2020 Census Data released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 23, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>The data is prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
   "<h2>Stay Tuned!</h2><p>The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 23, 2021. Once the 2020 Census Data is finalized, the online DistrictR mapping tool will be updated on the City’s website.</p>",
   "<h2><small>Quick Links to Other Napa County Agencies Participating in the Redistricting Process</small></h2><br/>\
   <ul><li><a href='/event/Napa_County'>Napa County</a></li>\
   <li><a href='/event/Napa_BOE'>Napa County Board of Education</a></li>\
   <li><a href='/event/Napa_College'>Napa Valley College</a></li></ul>",
 ],
 kern_county: [
   "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
san_joaquin: [
  "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
san_mateo_city: [
  "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
oakland: [
  "This mapping module uses the <strong>2020 Census Data</strong> population based on the legacy format dataset with processing by Redistricting Partners. The Statewide Database is currently working on the reallocation of the state prisoner population. Once the 2020 Census Data is finalized, this mapping module will be updated.<br/><br/>\
  For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
martinez: [
  "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
carpinteria: [
  "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
],
butte_county: [
  "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 humboldt_county: [
   "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 santa_clara_water: [
   "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
 ],
 mapsofla: [
    "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  san_jose: [
    "This mapping module displays the Legacy Format of the 2020 Census Data released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 23, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.\
    <br/><br/>\
    The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  siskiyou: [
    "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  redwood_city: [
    "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  cityofdallas: [
    "This mapping module uses the 2020 Decennial Census population processed by ARCBridge Consulting.\
    To learn more about ARCBridge – visit <a href='https://www.arcbridge.com' target='_blank'>their website</a>."
  ],
  santa_ana: [
    "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  ventura_county: [
    "This mapping module uses the <strong>official Redistricting Database for California</strong>, published by the Statewide Database with processing by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  yolo_county: [
    "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  solano_county: [
    "This mapping module displays 2015-2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  santa_clara_county: [
    "This mapping module displays the Legacy Format of the 2020 Census Data released by the U.S. Census Bureau on August 12, 2021. The Statewide Database is currently working on the reallocation of the state prisoner population. This prisoner population reallocation is estimated to take nearly a full month and the final 2020 Census Data will be available for official use by September 23, 2021. Once the 2020 Census Data is finalized, this mapping module will be updated.\
    <br/><br/>\
    The data was prepared by Redistricting Partners. For the last decade, Redistricting Partners has supported cities, community college districts, school boards, hospital districts, water boards, and other special districts. To learn more about their team <a href='https://redistrictingpartners.com/about/'>click here</a>.",
  ],
  prjusd: [
    "This mapping module displays 2019 American Community Survey data disaggregated onto Census blocks. The data was prepared by <a href='https://www.coopstrategies.com' target='_blank'>Cooperative Strategies</a>. Cooperative Strategies is a comprehensive planning and demographics firm that has been retained by the School District to assist in its transition from at-large to by-area elections. Over the last decade, Cooperative Strategies has assisted more than 50 school districts across California draw their voting areas.",
  ],
  yumasup: [
    "Yuma County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays population based on the 2020 Decennial Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  yumaawc: [
    "Arizona Western College Board of Trustees District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the three Yuma County districts as equal in population as possible and that each member represents about the same number of constituents. \
    We encourage residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full three-district map suggestions.",
    "This mapping module displays population based on the 2020 Decennial Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  saccounty: [
    "Sacramento County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county. \
    For more information, please visit <a href='https://www.saccounty.net/Redistricting/' target='_blank'>www.saccounty.net/Redistricting/</a>",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  sonomaco: [
    "Sonoma County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  pasadena2021: [
    "City of Pasadena City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the seven districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full seven-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  sunnyvale2021: [
    "City of Sunnyvale City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  laverne: [
    "City of La Verne City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  pomonaca: [
    "City of Pomona City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  richmondca: [
    "City of Richmond City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  elcajon: [
    "City of El Cajon City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  carlsbad2021: [
    "City of Carlsbad City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  encinitas2021: [
    "City of Encinitas City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  bp2021: [
    "City of Buena Park City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  hmb2021: [
    "City of Half Moon Bay City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  stockton2021: [
    "City of Stockton City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  lodi2021: [
    "City of Lodi City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  glendale2021: [
    "City of Glendale City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays population based on the 2020 Decennial Census and 2019 ACS for CVAP. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  marinco: [
    "Marin County District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  mercedco: [
    "Merced County District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  kingsco: [
    "Kings County District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  fremont2021: [
    "City of Fremont District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  campbellcity: [
    "City of Campell District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  ocsd: [
    "Oceano Community Services District's boundaries must be redrawn every 10 years using U.S. Census data in order to make the five divisions as equal in population as possible and that each member represents about the same number of constituents. \
    The CSD encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-division map suggestions for the whole district.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  buellton: [
    "City of Buellton District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  groverbeach: [
    "City of Grover Beach District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  vallejo: [
    "City of Vallejo District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the six districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full six-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  lakee: [
    "City of Lake Elsinore District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  chino2021: [
    "City of Chino District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  saccountymap: [
    "Sacramento County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county. \
    For more information, please visit <a href='https://www.saccounty.net/Redistricting/' target='_blank'>www.saccounty.net/Redistricting/</a>",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  fresno: [
    "Fresno County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  nevadaco: [
    "Nevada County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  sanmateoco: [
    "San Mateo County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  sanbenito: [
    "San Benito County Board of Supervisor District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  goleta: [
    "City of Goleta City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  marinaca: [
    "City of Marina City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  arroyog: [
    "Arroyo Grande City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  camarillo: [
    "Camarillo City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  bellflower: [
    "Bellflower City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  chulavista: [
    "Chula Vista City Council District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the four districts as equal in population as possible and that each member represents about the same number of constituents. \
    The City encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full four-district map suggestions for the whole city.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  sbcounty: [
    "Santa Barbara County Supervisorial District Boundaries must be redrawn every 10 years using U.S. Census data in order to make the five districts as equal in population as possible and that each member represents about the same number of constituents. \
    The County encourages residents to participate by suggesting neighborhood and community of interest maps of areas that should be kept undivided, and full five-district map suggestions for the whole county.",
    "This mapping module displays projected 2020 population based on the American Community Survey data disaggregated onto Census blocks. \
    The data was prepared by National Demographics Corporation. To learn more about their team click <a href='https://www.ndcresearch.com/about-us/' target='_blank'>here</a>.",
  ],
  commoncausepa: [
    "Common Cause Pennsylvania is the defender of citizens’ rights in the halls of power and in our communities.\
     Standing as an independent voice for positive change, a watchdog against corruption, and protector against abuse of power, \
     we work to hold public officials accountable and responsive to citizens. Common Cause Pennsylvania is a nonpartisan, good government organization."
  ],
};

const proposals_by_event = {
  centralsan: true,
  'pmc-districts': true,
  prjusd: true,
};

export default () => {
    const og_eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    );
    const eventCode = og_eventCode.toLowerCase();

    if (validEventCodes[eventCode]) {
        document.getElementById("eventHeadline").innerText = og_eventCode;
        if (coi_events.includes(eventCode)) {
            document.getElementById("introExplain").innerText = "Map Your Community";
            document.getElementById("introExplain").style.display = "block";
        } else if (eventCode === "mapsofla") {
            document.getElementById("introExplain").innerText = "";
            document.getElementById("eventHeadline").innerText = "#MapsofLA";
        } else if (eventCode === "city_of_napa") {
            document.getElementById("introExplain").innerHTML = "Draw a Map #RedrawNapa<br/>";
            document.getElementById("eventHeadline").innerText = "City_of_Napa";
            document.getElementById("communities").innerText = "Start Drawing a Map or Your Community of Interest!";
        } else if (eventCode === "cityofdallas") {
          document.getElementById("introExplain").innerHTML = "";
          document.getElementById("eventHeadline").innerText = "Welcome to the Public Mapping Page for the City of Dallas TX";
        }

    if (["mp-maps"].includes(eventCode)) {
        document.getElementById("eventHeadline").innerText = og_eventCode;
        document.getElementById("introExplain").innerText = "City of Menlo Park Redistricting";
        document.getElementById("introExplain").style.display = "block";
        }

    if (["commoncausepa"].includes(eventCode)) {
       document.getElementById("partnership-icons").style.display = "block";
       document.getElementById("partner-link-a").href = "https://www.commoncause.org/pennsylvania/";
       document.getElementById("partnership-a").src = "/assets/CC_Share_PA.png?v=2";
       document.getElementById("partner-link-b").href = "https://www.commoncause.org/";
       document.getElementById("partnership-b").src = "/assets/commoncauselogo.png?v=2";
          }

        if (["mesaaz", "slo_county", "napa_county", "san_jose", "siskiyou", "redwood_city", "ventura_county", "yolo_county", "solano_county", "santa_clara_county", "city_of_napa", "kern_county", "san_joaquin", "san_mateo_city", "oakland", "martinez", "butte_county", "santa_clara_water", "tuolumne", "napa_college", "napa_boe", "carpinteria", "humboldt_county", "mapsofla", "long_beach", "santa_ana", "imperial_county", "ojai", "foothilldeanza"].includes(eventCode)) {
            document.getElementById("partnership-icons").style.display = "block";
            if (eventCode === "mesaaz") {
              document.getElementById("partner-link-a").href = "https://www.mesaaz.gov";
              document.getElementById("partnership-a").src = "/assets/partners-mesa.jpeg?v=2";
            } else if (eventCode === "slo_county") {
              document.getElementById("partner-link-a").href = "https://www.slocounty.ca.gov/";
              document.getElementById("partnership-a").src = "/assets/partners-slo.png?v=2";
            } else if (eventCode === "napa_county") {
              document.getElementById("partner-link-a").href = "https://www.countyofnapa.org/";
              document.getElementById("partnership-a").src = "/assets/partners-napa.png?v=2";
              document.getElementById("partnership-a").style.background = '#252532';
            } else if (eventCode === "san_jose") {
              document.getElementById("partner-link-a").href = "https://www.sanjoseca.gov/your-government/departments";
              document.getElementById("partnership-a").src = "/assets/partners-sanjose.png?v=2";
              document.getElementById("partnership-a").style.background = '#043c4b';
            } else if (eventCode === "siskiyou") {
              document.getElementById("partner-link-a").href = "https://www.co.siskiyou.ca.us/";
              document.getElementById("partnership-a").src = "/assets/partners-siskiyou.png?v=2";
            } else if (eventCode === "redwood_city") {
              document.getElementById("partner-link-a").href = "https://www.redwoodcity.org/home";
              document.getElementById("partnership-a").src = "/assets/partners-redwood.jpeg?v=2";
            } else if (eventCode === "ventura_county") {
              document.getElementById("partner-link-a").href = "https://www.ventura.org/";
              document.getElementById("partnership-a").src = "/assets/partners-ventura.png?v=2";
            } else if (eventCode === "yolo_county") {
              document.getElementById("partner-link-a").href = "https://www.yolocounty.org/";
              document.getElementById("partnership-a").src = "/assets/partners-yolo.png?v=2";
              document.getElementById("partnership-a").style.background = '#375e97';
            } else if (eventCode === "solano_county") {
              document.getElementById("partner-link-a").href = "https://www.solanocounty.com";
              document.getElementById("partnership-a").src = "/assets/partners-solano.gif";
            } else if (eventCode === "foothilldeanza") {
              document.getElementById("partner-link-a").href = "https://www.fhda.edu";
              document.getElementById("partnership-a").src = "/assets/partners-foothill.jpeg";
            } else if (eventCode === "ojai") {
              document.getElementById("partner-link-a").href = "https://ojai.ca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-ojai.jpeg";
            } else if (eventCode === "imperial_county") {
              document.getElementById("partner-link-a").href = "https://imperialcounty.org";
              document.getElementById("partnership-a").src = "/assets/partners-imperial.png";
              document.getElementById("partnership-a").style.height = '85px';
              document.getElementById("partnership-a").style.marginTop = '-12px';
            } else if (eventCode === "santa_clara_county") {
              document.getElementById("partner-link-a").href = "https://www.sccgov.org/sites/scc/Documents/home.html";
              document.getElementById("partnership-a").src = "/assets/partners-sc-county.svg?v=2";
              document.getElementById("partnership-a").style.background = "#000";
            } else if (eventCode === "mapsofla") {
              document.getElementById("partner-link-a").href = "https://www.lacity.org";
              document.getElementById("partnership-a").src = "/assets/partners-lax.svg?v=2";
              document.getElementById("partnership-a").style.height = '160px';
              document.getElementById("partnership-a").style.marginTop = '-45px';
            } else if (eventCode === "san_mateo_city") {
              document.getElementById("partner-link-a").href = "https://www.cityofsanmateo.org";
              document.getElementById("partnership-a").src = "/assets/partners-sm-city.png?v=2";
            } else if (eventCode === "oakland") {
              document.getElementById("partner-link-a").href = "https://www.oaklandca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-oakland.png?v=2";
            } else if (eventCode === "martinez") {
              document.getElementById("partner-link-a").href = "https://www.cityofmartinez.org";
              document.getElementById("partnership-a").src = "/assets/partners-martinez.png?v=2";
            } else if (eventCode === "carpinteria") {
              document.getElementById("partner-link-a").href = "https://carpinteriaca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-carpinteria.png?v=2";
            } else if (eventCode === "santa_clara_water") {
              document.getElementById("partner-link-a").href = "https://www.valleywater.org";
              document.getElementById("partnership-a").src = "/assets/partners-sc-water.png?v=2";
            } else if (eventCode === "kern_county") {
              document.getElementById("partner-link-a").href = "https://www.kerncounty.com";
              document.getElementById("partnership-a").src = "/assets/partners-kern.png?v=2";
            } else if (eventCode === "tuolumne") {
              document.getElementById("partner-link-a").href = "https://www.tuolumnecounty.ca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-tuolumne.png?v=2";
            } else if (eventCode === "napa_boe") {
              document.getElementById("partner-link-a").href = "https://napacoe.org/board-of-education/";
              document.getElementById("partnership-a").src = "/assets/partners-napa-boe.png?v=2";
            } else if (eventCode === "butte_county") {
              document.getElementById("partner-link-a").href = "https://www.buttecounty.net";
              document.getElementById("partnership-a").src = "/assets/partners-butte.png?v=2";
            } else if (eventCode === "city_of_napa") {
              document.getElementById("partner-link-a").href = "https://www.cityofnapa.org";
              document.getElementById("partnership-a").src = "/assets/partners-napa-city.png?v=2";
            } else if (eventCode === "humboldt_county") {
              document.getElementById("partner-link-a").href = "https://humboldtgov.org";
              document.getElementById("partnership-a").src = "/assets/partners-humboldt.png?v=2";
              document.getElementById("partnership-a").style.background = "#46798b";
            } else if (eventCode === "napa_college") {
              document.getElementById("partner-link-a").href = "https://napavalley.edu/AboutNVC/Trustees/Pages/default.aspx";
              document.getElementById("partnership-a").src = "/assets/partners-napa-college.png?v=2";
            } else if (eventCode === "long_beach") {
              document.getElementById("partner-link-a").href = "https://www.longbeach.gov";
              document.getElementById("partnership-a").src = "/assets/partners-longbeach.jpeg";
            } else if (eventCode === "santa_ana") {
              document.getElementById("partner-link-a").href = "https://www.santa-ana.org";
              document.getElementById("partnership-a").src = "/assets/partners-santa-ana.png";
            } else if (eventCode === "san_joaquin") {
              document.getElementById("partner-link-a").href = "https://www.sjgov.org";
              document.getElementById("partnership-a").src = "/assets/partners-sanjoaquin.svg?v=2";
              document.getElementById("partnership-a").style.background = "#315470";
            }

            document.getElementById("partner-link-b").href = "https://redistrictingpartners.com";
            document.getElementById("partnership-b").src = "/assets/partners-rp.png?v=2";
        } else if (["saccounty", "saccountymap", "sonomaco", "pasadena2021", "sbcounty", "goleta", "marinco", "fresno", "nevadaco", "kingsco", "mercedco", "marinaca", "arroyog", "sanmateoco", "sanbenito", "chulavista", "camarillo", "bellflower", "fresnocity", "campbellcity", "chino2021", "fremont2021", "lakee", "vallejo", "ocsd", "buellton", "groverbeach",
          "sunnyvale2021", "lodi2021", "laverne", "elcajon", "richmondca", "carlsbad2021", "pomonaca", "encinitas2021", "bp2021", "hmb2021", "stockton2021", "glendale2021", "yumasup", "yumaawc"].includes(eventCode)) {
            document.getElementById("partnership-icons").style.display = "block";
            document.getElementById("partnership-b").src = "/assets/partners-ndc.png?v=2";
            document.getElementById("partner-link-b").href = "https://www.ndcresearch.com/";
            if (eventCode === "sonomaco") {
              document.getElementById("partner-link-a").href = "https://sonomacounty.ca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-sonoma.png?v=2";
            } else if (eventCode === "pasadena2021") {
              document.getElementById("partner-link-a").href = "https://www.cityofpasadena.net/";
              document.getElementById("partnership-a").src = "/assets/partners-pasadena.png?v=2";
              document.getElementById("partnership-a").style.background = "#00275d";
            } else if (eventCode === "sbcounty") {
              document.getElementById("partner-link-a").href = "https://www.countyofsb.org/";
              document.getElementById("partnership-a").src = "/assets/partners-santabarbara.png?v=2";
              document.getElementById("partnership-a").style.background = "#22a8c4";
            } else if (eventCode === "goleta") {
              document.getElementById("partner-link-a").href = "https://www.cityofgoleta.org/";
              document.getElementById("partnership-a").src = "/assets/partners-goleta.png?v=2";
            } else if (eventCode === "yumasup") {
              document.getElementById("partner-link-a").href = "https://www.yumacountyaz.gov";
              document.getElementById("partnership-a").src = "/assets/partners-yuma.png";
            } else if (eventCode === "yumaawc") {
              document.getElementById("partner-link-a").href = "https://www.azwestern.edu";
              document.getElementById("partnership-a").src = "/assets/partners-awc.png";
            } else if (eventCode === "marinco") {
              document.getElementById("partner-link-a").href = "https://www.marincounty.org/";
              document.getElementById("partnership-a").src = "/assets/partners-marin.png?v=2";
            } else if (eventCode === "marinaca") {
              document.getElementById("partner-link-a").href = "https://cityofmarina.org/";
              document.getElementById("partnership-a").src = "/assets/partners-marina.png?v=2";
            } else if (eventCode === "arroyog") {
              document.getElementById("partner-link-a").href = "http://www.arroyogrande.org/";
              document.getElementById("partnership-a").src = "/assets/partners-arroyo.png?v=2";
            } else if (eventCode === "fresno") {
              document.getElementById("partner-link-a").href = "https://www.co.fresno.ca.us/";
              document.getElementById("partnership-a").src = "/assets/partners-fresno.png?v=2";
              document.getElementById("partnership-a").style.background = "#1C385A";
            } else if (eventCode === "fresnocity") {
              document.getElementById("partner-link-a").href = "https://fresno.gov";
              document.getElementById("partnership-a").src = "/assets/partners-fresno-city.jpeg?v=2";
            } else if (eventCode === "nevadaco") {
              document.getElementById("partner-link-a").href = "https://www.mynevadacounty.com/";
              document.getElementById("partnership-a").src = "/assets/partners-ca_nevada.png?v=2";
            } else if (eventCode === "sanmateoco") {
              document.getElementById("partner-link-a").href = "https://www.smcgov.org/";
              document.getElementById("partnership-a").src = "/assets/partners-sanmateoco.png?v=2";
            } else if (eventCode === "kingsco") {
              document.getElementById("partner-link-a").href = "https://www.countyofkings.com/";
              document.getElementById("partnership-a").src = "/assets/partners-kings.svg?v=2";
              document.getElementById("partnership-a").style.background = "#142942";
            } else if (eventCode === "mercedco") {
              document.getElementById("partner-link-a").href = "https://www.co.merced.ca.us/";
              document.getElementById("partnership-a").src = "/assets/partners-merced.png?v=2";
            } else if (eventCode === "sanbenito") {
              document.getElementById("partner-link-a").href = "https://www.cosb.us/";
              document.getElementById("partnership-a").src = "/assets/partners-sanbenito.svg?v=2";
            } else if (eventCode === "camarillo") {
              document.getElementById("partner-link-a").href = "https://www.ci.camarillo.ca.us/";
              document.getElementById("partnership-a").src = "/assets/partners-camarillo.png?v=2";
            } else if (eventCode === "chulavista") {
              document.getElementById("partner-link-a").href = "https://www.chulavistaca.gov/";
              document.getElementById("partnership-a").src = "/assets/partners-chulavista.png?v=2";
            } else if (eventCode === "bellflower") {
              document.getElementById("partner-link-a").href = "https://www.bellflower.org/";
              document.getElementById("partnership-a").src = "/assets/partners-bellflower.png?v=2";
            } else if (eventCode === "lakee") {
              document.getElementById("partner-link-a").href = "http://www.lake-elsinore.org";
              document.getElementById("partnership-a").src = "/assets/partners-lake_el.png?v=2";
            } else if (eventCode === "chino2021") {
              document.getElementById("partner-link-a").href = "https://www.cityofchino.org";
              document.getElementById("partnership-a").src = "/assets/partners-chino.png?v=2";
            } else if (eventCode === "campbellcity") {
              document.getElementById("partner-link-a").href = "https://www.ci.campbell.ca.us";
              document.getElementById("partnership-a").src = "/assets/partners-campbell.png?v=2";
              document.getElementById("partnership-a").style.background = "#143e5d";
            } else if (eventCode === "fremont2021") {
              document.getElementById("partner-link-a").href = "https://www.fremont.gov";
              document.getElementById("partnership-a").src = "/assets/partners-fremont.png?v=2";
            } else if (eventCode === "buellton") {
              document.getElementById("partner-link-a").href = "https://cityofbuellton.com";
              document.getElementById("partnership-a").src = "/assets/partners-buellton.webp";
            } else if (eventCode === "groverbeach") {
              document.getElementById("partner-link-a").href = "https://www.grover.org";
              document.getElementById("partnership-a").src = "/assets/partners-grover.png?v=2";
            } else if (eventCode === "ocsd") {
              document.getElementById("partner-link-a").href = "https://oceanocsd.org";
              document.getElementById("partnership-a").src = "/assets/partners-oceano.png?v=2";
            } else if (eventCode === "vallejo") {
              document.getElementById("partner-link-a").href = "https://www.cityofvallejo.net";
              document.getElementById("partnership-a").src = "/assets/partners-vallejo.png?v=2";
            } else if (eventCode === "sunnyvale2021") {
              document.getElementById("partner-link-a").href = "https://sunnyvale.ca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-sunnyvale.svg?v=2";
            } else if (eventCode === "laverne") {
              document.getElementById("partner-link-a").href = "https://www.cityoflaverne.org";
              document.getElementById("partnership-a").src = "/assets/partners-laverne.gif";
            } else if (eventCode === "pomonaca") {
              document.getElementById("partner-link-a").href = "https://www.pomonaca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-pomona.png?v=2";
            } else if (eventCode === "richmondca") {
              document.getElementById("partner-link-a").href = "https://www.ci.richmond.ca.us";
              document.getElementById("partnership-a").src = "/assets/partners-richmond.png?v=2";
            } else if (eventCode === "elcajon") {
              document.getElementById("partner-link-a").href = "https://www.elcajon.gov";
              document.getElementById("partnership-a").src = "/assets/partners-elcajon.png?v=2";
            } else if (eventCode === "carlsbad2021") {
              document.getElementById("partner-link-a").href = "https://www.carlsbadca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-carlsbad.png?v=2";
            } else if (eventCode === "encinitas2021") {
              document.getElementById("partner-link-a").href = "https://encinitasca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-encinitas.png?v=2";
              document.getElementById("partnership-a").style.background = "#000";
            } else if (eventCode === "bp2021") {
              document.getElementById("partner-link-a").href = "http://www.buenapark.com";
              document.getElementById("partnership-a").src = "/assets/partners-buenapark.png?v=2";
              document.getElementById("partnership-a").style.background = "#263f55";
            } else if (eventCode === "hmb2021") {
              document.getElementById("partner-link-a").href = "https://www.half-moon-bay.ca.us";
              document.getElementById("partnership-a").src = "/assets/partners-halfmoon.png?v=2";
              document.getElementById("partnership-a").style.background = "#00457e";
            } else if (eventCode === "stockton2021") {
              document.getElementById("partner-link-a").href = "http://www.stocktonca.gov";
              document.getElementById("partnership-a").src = "/assets/partners-stockton.png?v=2";
            } else if (eventCode === "glendale2021") {
              document.getElementById("partner-link-a").href = "https://www.glendaleaz.com";
              document.getElementById("partnership-a").src = "/assets/partners-glendale.svg";
              document.getElementById("partnership-a").style.background = "#888";
            } else if (eventCode === "lodi2021") {
              document.getElementById("partner-link-a").href = "https://www.lodi.gov";
              document.getElementById("partnership-a").src = "/assets/partners-lodi.png?v=2";
              document.getElementById("partnership-a").style.background = "#000";
            } else {
              document.getElementById("partner-link-a").href = "https://www.saccounty.net/Redistricting/Pages/default.aspx";
              document.getElementById("partnership-a").src = "/assets/partners-sacramento.png?v=2";
            }
        } else if (["cityofdallas"].includes(eventCode)) {
          document.getElementById("partnership-icons").style.display = "block";
          document.getElementById("partnership-b").src = "/assets/partners-arcbridge.jpeg";
          document.getElementById("partner-link-b").href = "https://www.arcbridge.com";
          document.getElementById("partner-link-a").href = "https://dallascityhall.com";
          document.getElementById("partnership-a").src = "/assets/partners-dallas.png";

        }

        // document.getElementById("eventCode").innerText = og_eventCode;
        if (eventDescriptions[eventCode]) {
            let desc = document.createElement("div");
            desc.innerHTML = eventDescriptions[eventCode];
            document.getElementById("event-description").prepend(desc);
        }
        if (longAbout[eventCode]) {
            document.getElementById("about-section").style.display = "block";
            document.getElementsByClassName("about-section")[0].style.display = "list-item";
            document.getElementById("about-section-text").innerHTML = longAbout[eventCode].map(p => '<p>' + p + '</p>').join("");
        }
        if (eventCode === "ttt") {
            let title = document.getElementById("districting-options-title");
            render(html`<text class="italic-note">This is a training page for using Districtr to draw districts and map communities.
            You can start in any state and use the tag "TTT" to post here.</text>`, title);
            let map_section = document.getElementById("districting-options");
            render(until(PlaceMapWithData((tgt) => toStateCommunities(tgt, 'ttt')), ""), map_section);
        }

        if (eventCode === "open-maps") {
          // ohio mini-map
          document.getElementById("mini-maps").style.display = "block";
          document.getElementById("districting-options").style.display = "none";
          document.getElementById("districting-options-title").style.display = "none";
          const scale = 3200;
          const translate = [-440, 240];
          const path = geoPath(
              geoAlbersUsaTerritories()
                  .scale(scale)
                  .translate(translate)
          ).pointRadius(9);
          fetch("/assets/oh-zone-map.geojson").then(res => res.json()).then(gj => {
            render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
              <g id="states-group" @mouseleave=${() => {}}>
                ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                    return svg`<path id="x" stroke-width="0"
                        d="${path(feature)}"
                        @click=${(e) => {
                            document.querySelectorAll(".pcommunity")[0].click();
                        }}
                    ></path>`;
                })}
                </g>
              </svg>`, document.getElementById("mini-map-0"));

            render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
              <g id="states-group" @mouseleave=${() => {}}>
                ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                    return svg`<path id="x" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                        d="${path(feature)}"
                        @click=${(e) => {
                          document.querySelector(".pcommunity." + feature.properties.name).click();
                        }}></path>`;
                })}
                </g>
              </svg>`, document.getElementById("mini-map"));


              render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
                <g id="states-group" @mouseleave=${() => {}}>
                  ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                      return svg`<path id="x" fill="#ccc" stroke-width="0"
                          d="${path(feature)}"
                      ></path>`;
                  })}
                  ${gj.features.filter(f => f.geometry.type === "Point").map((feature, idx) => {
                      return svg`<path class="circle"
                          d="${path(feature)}"
                          @mouseover=${() => {
                            document.getElementById("city-caption").innerText = feature.properties.name;
                          }}
                          @mouseout=${() => {
                            document.getElementById("city-caption").innerText = "";
                          }}
                          @click=${(e) => {
                            document.querySelectorAll(".pcommunity").forEach((block) => {
                                let city = block.innerText.trim().split("\n")[0].toLowerCase();
                                if (feature.properties.name.toLowerCase().includes(city)) {
                                    block.click();
                                }
                            });
                          }}></path>`;
                  })}
                  </g>
                </svg>`, document.getElementById("mini-map-2"));
          });
        }

        if (document.getElementById("draw-goal")) {
          if (hybrid_events.includes(eventCode)) {
            document.getElementById("draw-goal").innerText = 'drawing';
          } else {
            document.getElementById("draw-goal").innerText = coi_events.includes(eventCode) ? "drawing your community" : "drawing districts";
          }
        }

        const target = document.getElementById("districting-options");
        if (typeof validEventCodes[eventCode] === 'string') {
            validEventCodes[eventCode] = [validEventCodes[eventCode]];
        }
        if (!validEventCodes[eventCode].length) {
            document.getElementById("communities").style.display = "none";
            document.getElementsByClassName("draw-section")[0].style.display = "none";
            document.getElementsByTagName("p")[0].style.display = "none";
        }

        listPlacesForState(stateForEvent[eventCode], coi_events.includes(eventCode)).then(places => {
            validEventCodes[eventCode].forEach(placeID => {
                let place = places.find(p => p.id === placeID);
                if (coi_events.includes(eventCode) || coi_events.includes(placeID)) {
                    place.districtingProblems = [
                        { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                    ];
                } else if (eventCode === "mapsofla") {
                    place.districtingProblems = place.districtingProblems.map(p => ({
                      ...p,
                      number_intro: 'Draw the ',
                    }))
                }
                if (unitTypes[eventCode]) {
                    if (unitTypes[eventCode].no) {
                        // block-list
                        place.units = place.units.filter(u => !unitTypes[eventCode].no.includes(u.name));
                    } else if (unitTypes[eventCode].yes) {
                        // allow-list
                        place.units = place.units.filter(u => unitTypes[eventCode].yes.includes(u.name));
                    }
                }
                const mydiv = document.createElement('li');
                target.append(mydiv);
                until(render(placeItems(place, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv), "Loading...");

                if (hybrid_events.includes(eventCode)) {
                    const mydiv2 = document.createElement('li');
                    target.append(mydiv2);
                    render(placeItems({
                      ...place,
                      districtingProblems: [
                        { type: 'community', numberOfParts: 250, pluralNoun: "Community",
                          custom_intro: (eventCode === "mapsofla") ? "Draw your community" : "",
                        }
                      ]
                    }, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv2);
                }
            });
        });

        // hide Start Drawing section for pmc-districts
        if (eventCode == 'pmc-districts') {
          document.getElementById("communities").style.display = 'none';
          document.getElementById("districting-options-title").style.display = 'none';
          target.style.display = 'none';
        }

        let limitNum = 8;
        let eventurl = (window.location.hostname === "localhost")
                    ? "/assets/sample_event.json"
                    : (`/.netlify/functions/eventRead?skip=0&limit=${limitNum + 1}&event=${eventCode}`);

        let showPlans = (data, drafts = false) => {
            console.log(["showPlans", data, drafts]);
            let loadExtraPlans = (data.plans.length > limitNum) || window.location.hostname.includes("localhost");
            if (loadExtraPlans) {
                data.plans.pop();
            }
            // hide at start
            if (drafts && draftskip < 0)
              data.plans = [];
            drafts
              ? prevDrafts = prevDrafts.concat(data.plans.filter(p => !((blockPlans[eventCode] || []).includes(p.simple_id))))
              : prevPlans = prevPlans.concat(data.plans.filter(p => !((blockPlans[eventCode] || []).includes(p.simple_id))));
            const plans = [{
                title: (eventCode === "missouri-mapping" ? "What community maps can look like" :
                (drafts ? "Works in Progress" : "Public Gallery")),
                plans: drafts ? prevDrafts : prevPlans,
            }];
            let pinwheel = drafts ? "event-pinwheel-drafts" : "event-pinwheel";
            let button = drafts ? "loadMoreDrafts" : "loadMorePlans";
            let fetchurl = drafts ? eventurl + "&type=draft" : eventurl;

            if (eventCode != 'pmc-districts') {  // do not show for PMC Districts
              render(html`
                  ${plansSection(plans, eventCode)}
                  ${loadExtraPlans ?
                    html`<button id="${button}" @click="${(e) => {
                        document.getElementById(pinwheel).style.display = "block";
                        document.getElementById(button).disabled = true;
                        fetch(fetchurl.replace("skip=0", `skip=${drafts ? draftskip+limitNum : skip+limitNum}`)).then(res => res.json()).then(d => {
                          drafts ? draftskip += limitNum : skip += limitNum;
                          document.getElementById(pinwheel).style.display = "none";
                          document.getElementById(button).disabled = false;
                          showPlans(d, drafts);
                        });
                    }}">Load ${drafts ? (draftskip < 0 ? "Drafts" : "More Drafts" ) : "More Plans"}</button>
                    ${loadExtraPlans ? html`<img id="${pinwheel}" src="/assets/pinwheel2.gif" style="display:none"/>` : ""}`
                  : ""}
              `, drafts ? document.getElementById("drafts") : document.getElementById("plans"));
            }
            // While we are here, remove the nav bar links
            else {
              document.getElementById('shared-nav').style.display = "none";
              document.getElementById('drafts-nav').style.display = "none";
            }
            if (proposals_by_event[eventCode]) {
                fetch(`/assets/plans/${eventCode}.json`).then(res => res.json()).then(sample => {
                    render(plansSection([{ title: 'Sample plans', plans: sample.plans, desc: (sample.description ? sample.description : null) }], eventCode, true), document.getElementById("proposals"));
                });
            } else {
                document.getElementById("sample_plan_link").style.display = "none";
            }
        }

        fetch(eventurl).then(res => res.json()).then(showPlans);
        let drafturl = eventurl + (window.location.hostname === "localhost" ? "" : "&type=draft");
        fetch(drafturl.replace(`limit=${limitNum + 1}`, "limit=0")).then(res => res.json()).then(p => showPlans(p, true))
    } else {
        const target = document.getElementById("districting-options");
        render("Tag or Organization not recognized", target);
    }
};

const plansSection = (plans, eventCode, isProfessionalSamples) =>
    plans.map(
        ({ title, plans, desc }) => html`
            <section id="${isProfessionalSamples ? "sample" : "shared"}" class="place__section">
                <h2>${title}</h2>
                ${(isProfessionalSamples || !proposals_by_event[eventCode])
                  ? html`<p>
                    ${(["saccounty", "saccountymap", "city_of_napa"].includes(eventCode) || !plans.length)
                      ? "As maps are submitted they will appear below, and you will be able to click on any of the maps to open it in Districtr."
                      : ((eventCode == 'pmc-districts')
                        ? html`Click on any of the maps below to open it in Districtr. If you edit one of these plans, and save
                            it with the tag "pmc", it will be added to the gallery <a href='/event/pmc' target='_blank'>here</a>.
                            <b>These sample plans were generated randomly, using various combinations of the PMC’s criteria.
                             They are intended for use as starting points for exploration. You can read more about their properties
                             in <a href='https://www.dropbox.com/s/udenpl7zns12b22/Wisconsin.pdf?dl=0' target='_blank'>this summary</a>,
                             which includes data on the plans.</b>`
                        : "Click on any of the maps below to open it in Districtr.")
                      }
                </p>` : null}
                ${desc ? html`<h4>${desc}</h4>` : ""}
                <ul class="plan-thumbs">
                    ${plans.map((p, i) => loadablePlan(p, (eventCode == 'pmc-districts') ? 'pmc' : eventCode, isProfessionalSamples))}
                </ul>
            </section>
        `
    );

const loadablePlan = (plan, eventCode, isProfessionalSamples) => {
    let completness = null,
        unitCount = plan.filledBlocks || Object.keys(plan.plan.assignment || {}).length,
        districtCount = (new Set(
            Object.values(plan.plan.assignment || {})
                  .map(z => (z && z.length) ? z[0] : z)
                  .filter(z => ![null, "null", undefined, "undefined", -1].includes(z))
        )).size,
        districtGoal = plan.plan.problem.numberOfParts,
        districtOff = !coi_events.includes(eventCode) && !hybrid_events.includes(eventCode) && (districtCount < districtGoal),
        unitOff = !coi_events.includes(eventCode) && !hybrid_events.includes(eventCode) && unitCounts[eventCode] && (unitCount < unitCounts[eventCode]);

    let screenshot = plan.screenshot2 || plan.screenshot;
    let urlcode = eventCode;
    if (portal_events.includes(eventCode)) {
      urlcode += '&portal';
    }

    return html`
    <a href="/edit/${plan.simple_id || plan._id}?event=${urlcode}">
        <li class="plan-thumbs__thumb">
            ${(screenshot && screenshot.length > 60 && screenshot.indexOf("data") === 0)
                ? html`<img
                    class="thumb__img"
                    src="${screenshot}"
                    alt="Districting Plan ${plan.simple_id}"
                />`
                : ''
            }
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.planName || ''}
                      <br/>
                      ID: ${plan.simple_id || plan._id}</h6>
                <br/>
                ${(plan.isScratch ? html`<h4 style="font-style: italic">Draft Plan</h4>` : "")}
                <span>
                  ${plan.plan.place.name || ""}
                  <br/>
                  ${(plan.plan.problem.type === "community")
                    ? "Communities of Interest"
                    : plan.plan.problem.pluralNoun
                  }
                  <br/>
                  from ${plan.plan.units.name}
                </span>
                <br/>
                ${isProfessionalSamples ? "" : html`<span>Updated<br/>
                      ${(new Date(plan.startDate)).toLocaleString()}</span>`}
            </figcaption>
            ${(coi_events.includes(eventCode) || isProfessionalSamples)
                ? null
                : html`
                  <span style="margin:10px">
                      ${(coi_events.includes(eventCode) || districtGoal == 250) ? "" : (districtCount + "/" + districtGoal + " districts")}
                      ${unitOff ? html`<br/>` : null }
                      ${unitOff ? (Math.floor(100 * unitCount/unitCounts[eventCode]) + "% of units") : null}
                  </span>
                  <span style="margin:10px;margin-top:0;">
                    ${(districtOff || unitOff)
                        ? "Incomplete"
                        : "Complete"}
                  </span>`
            }
        </li>
    </a>`;
}

function toStateCommunities(s, eventCode) {
    let show_just_communities = true;
    let tgt = document.getElementById('districting-options');
    render("", tgt)
    listPlaces(null, s.properties.NAME).then(items => {
      let placesList = items.filter(place => !place.limit || show_just_communities)
          .map(communitiesFilter)
      let lstdiv = document.createElement('div');
      tgt.append(lstdiv)
      placesList.forEach(place => {
        place.districtingProblems = [
            { type: "community", numberOfParts: 250, pluralNoun: "Community" }
          ]
          const mydiv = document.createElement('li');
          lstdiv.append(mydiv);
          render(placeItems(place, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv);
      })
    });
}
