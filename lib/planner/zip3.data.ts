// ZIP3 -> state ranges (BLUEPRINT.md §2.3: "a hard-coded ~60-row USPS ZIP3->state range table" -- the
// gazetteer's ZCTA centroids have no state column of their own, so this coarse range table is what actually
// resolves the state). Standard USPS ZIP3 block assignment; each entry is [firstZip3, lastZip3, state].
// Territories and military codes (000-009, 340, 962-966, 969) have no station and resolve to undefined.
export const ZIP3_STATE_RANGES: [number, number, string][] = [
  [10, 27, "MA"],
  [28, 29, "RI"],
  [30, 38, "NH"],
  [39, 49, "ME"],
  [50, 59, "VT"],
  [60, 69, "CT"],
  [70, 89, "NJ"],
  [100, 149, "NY"],
  [150, 196, "PA"],
  [197, 199, "DE"],
  [200, 205, "DC"],
  [206, 219, "MD"],
  [220, 246, "VA"],
  [247, 268, "WV"],
  [270, 289, "NC"],
  [290, 299, "SC"],
  [300, 319, "GA"],
  [398, 399, "GA"],
  [320, 339, "FL"],
  [341, 349, "FL"],
  [350, 369, "AL"],
  [370, 385, "TN"],
  [386, 397, "MS"],
  [400, 427, "KY"],
  [430, 459, "OH"],
  [460, 479, "IN"],
  [480, 499, "MI"],
  [500, 528, "IA"],
  [530, 549, "WI"],
  [550, 567, "MN"],
  [570, 577, "SD"],
  [580, 588, "ND"],
  [590, 599, "MT"],
  [600, 629, "IL"],
  [630, 658, "MO"],
  [660, 679, "KS"],
  [680, 693, "NE"],
  [700, 714, "LA"],
  [716, 729, "AR"],
  [730, 749, "OK"],
  [750, 799, "TX"],
  [885, 885, "TX"],
  [800, 816, "CO"],
  [820, 831, "WY"],
  [832, 838, "ID"],
  [840, 847, "UT"],
  [850, 865, "AZ"],
  [870, 884, "NM"],
  [889, 898, "NV"],
  [900, 961, "CA"],
  [967, 968, "HI"],
  [970, 979, "OR"],
  [980, 994, "WA"],
  [995, 999, "AK"],
];

// Curated overrides for well-known metro ZIP3 prefixes, so a resolution inside a multi-station state prefers
// the geographically nearest city rather than always falling back to the state's primary station. Not
// exhaustive -- every non-primary station is still reachable by state fallback when its own metro prefix
// isn't listed here (§2.3's "committed prefix-range table" is the same kind of pragmatic approximation, built
// from the Census gazetteer rather than hand-picked, but serves the same purpose).
export const ZIP3_STATION_OVERRIDES: Record<string, string> = {
  // Alaska: 995-996 Anchorage (state primary, no override needed), 997 Fairbanks, 998-999 Juneau/southeast.
  "997": "AK-fairbanks", "998": "AK-juneau", "999": "AK-juneau",
  // Arizona
  "856": "AZ-tucson", "857": "AZ-tucson", "859": "AZ-tucson", "860": "AZ-flagstaff", "863": "AZ-flagstaff", "864": "AZ-flagstaff",
  // California
  "941": "CA-san-francisco", "940": "CA-san-francisco", "943": "CA-san-francisco", "944": "CA-san-francisco", "945": "CA-san-francisco", "947": "CA-san-francisco", "949": "CA-san-francisco",
  "942": "CA-sacramento", "956": "CA-sacramento", "957": "CA-sacramento", "958": "CA-sacramento", "959": "CA-sacramento", "960": "CA-sacramento",
  "936": "CA-fresno", "937": "CA-fresno", "932": "CA-fresno", "933": "CA-fresno", "934": "CA-fresno",
  "919": "CA-san-diego", "920": "CA-san-diego", "921": "CA-san-diego",
  "961": "CA-truckee-tahoe", "930": "CA-truckee-tahoe",
  // Colorado
  "809": "CO-colorado-springs", "808": "CO-colorado-springs", "815": "CO-grand-junction", "814": "CO-grand-junction",
  // Idaho
  "834": "ID-idaho-falls", "832": "ID-idaho-falls",
  // Illinois
  "611": "IL-rockford", "610": "IL-rockford", "627": "IL-springfield", "626": "IL-springfield",
  // Indiana
  "466": "IN-south-bend", "465": "IN-south-bend",
  // Iowa
  "506": "IA-waterloo", "507": "IA-waterloo",
  // Kansas
  "664": "KS-topeka", "666": "KS-topeka",
  // Kentucky
  "405": "KY-lexington", "403": "KY-lexington", "404": "KY-lexington",
  // Louisiana
  "711": "LA-shreveport", "710": "LA-shreveport", "712": "LA-shreveport",
  // Maine
  "047": "ME-caribou", "049": "ME-caribou",
  // Massachusetts
  "015": "MA-worcester", "016": "MA-worcester",
  // Michigan
  "493": "MI-grand-rapids", "494": "MI-grand-rapids", "495": "MI-marquette", "497": "MI-marquette", "498": "MI-marquette", "499": "MI-marquette",
  // Minnesota
  "557": "MN-duluth", "558": "MN-duluth", "560": "MN-international-falls", "566": "MN-international-falls",
  // Missouri
  "640": "MO-kansas-city", "641": "MO-kansas-city", "644": "MO-kansas-city", "648": "MO-kansas-city", "649": "MO-kansas-city",
  // Montana
  "594": "MT-great-falls", "598": "MT-missoula", "599": "MT-missoula",
  // Nebraska
  "691": "NE-north-platte", "693": "NE-north-platte",
  // Nevada
  "895": "NV-reno", "894": "NV-reno", "897": "NV-reno",
  // New Hampshire
  "032": "NH-concord", "033": "NH-concord",
  // New Mexico
  "875": "NM-santa-fe", "874": "NM-santa-fe",
  // New York
  "100": "NY-new-york-city", "101": "NY-new-york-city", "102": "NY-new-york-city", "103": "NY-new-york-city", "104": "NY-new-york-city", "110": "NY-new-york-city", "111": "NY-new-york-city", "112": "NY-new-york-city", "113": "NY-new-york-city", "114": "NY-new-york-city", "116": "NY-new-york-city",
  "122": "NY-albany", "120": "NY-albany", "121": "NY-albany",
  "142": "NY-buffalo", "140": "NY-buffalo", "141": "NY-buffalo",
  "132": "NY-syracuse", "130": "NY-syracuse", "131": "NY-syracuse",
  // North Carolina
  "276": "NC-raleigh", "277": "NC-raleigh", "278": "NC-raleigh", "288": "NC-asheville", "287": "NC-asheville",
  // North Dakota
  "585": "ND-bismarck", "586": "ND-bismarck",
  // Ohio
  "441": "OH-cleveland", "440": "OH-cleveland", "442": "OH-cleveland", "452": "OH-cincinnati", "450": "OH-cincinnati", "451": "OH-cincinnati",
  // Oklahoma
  "741": "OK-tulsa", "740": "OK-tulsa", "743": "OK-tulsa",
  // Oregon
  "978": "OR-pendleton-e-oregon", "979": "OR-pendleton-e-oregon",
  // Pennsylvania
  "152": "PA-pittsburgh", "150": "PA-pittsburgh", "151": "PA-pittsburgh", "170": "PA-harrisburg", "171": "PA-harrisburg", "165": "PA-erie", "164": "PA-erie",
  // South Dakota
  "577": "SD-rapid-city",
  // Tennessee
  "381": "TN-memphis", "380": "TN-memphis", "383": "TN-memphis",
  // Texas
  "770": "TX-houston", "771": "TX-houston", "772": "TX-houston", "773": "TX-houston", "774": "TX-houston", "775": "TX-houston", "776": "TX-houston", "777": "TX-houston", "778": "TX-houston",
  "782": "TX-san-antonio", "780": "TX-san-antonio", "781": "TX-san-antonio",
  "787": "TX-austin", "786": "TX-austin",
  "798": "TX-el-paso", "799": "TX-el-paso", "885": "TX-el-paso",
  "790": "TX-amarillo", "791": "TX-amarillo",
  // Virginia
  "220": "VA-dulles-n-virginia", "221": "VA-dulles-n-virginia", "222": "VA-dulles-n-virginia",
  "240": "VA-roanoke", "241": "VA-roanoke",
  // Washington
  "992": "WA-spokane", "990": "WA-spokane", "991": "WA-spokane",
  // Wisconsin
  "537": "WI-madison", "535": "WI-madison", "543": "WI-green-bay", "541": "WI-green-bay",
  // Wyoming
  "826": "WY-casper", "827": "WY-casper",
};
