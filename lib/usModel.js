/* globals topojson */
/**
 * This file provides API to render USA paths and get state names by their ids.
 */
var unitedState = require('../data/us-states.json');

var usPaths = topojson.feature(unitedState, unitedState.objects.states).features;
var names = makeNames();

module.exports = {
  getName: getName,
  paths: usPaths
};

function getName(d) {
  return names[d.id];
}

/**
 * mAps state id from topojson file to state name
 */
function makeNames() {
  return {
    "1": "Alabama",
    "2": "Alaska",
    "4": "Arizona",
    "5": "Arkansas",
    "6": "California",
    "8": "Colorado",
    "9": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming",
    "60": "America Samoa",
    "64": "Federated States of Micronesia",
    "66": "Guam",
    "68": "Marshall Islands",
    "69": "Northern Mariana Islands",
    "70": "Palau",
    "72": "Puerto Rico",
    "74": "U.S. Minor Outlying Islands",
    "78": "Virgin Islands of the United States"
  };
}
