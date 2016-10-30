module.exports = getCountryColors;

function getCountryColors() {
  var countries = getCountries();
  var colors = getColors();
  var max = 0;
  var min = Number.POSITIVE_INFINITY;
  var results = Object.keys(countries).map(key => {
    var value = countries[key];
    if (value > max)
      max = countries[key];
    if (value < min)
      min = value;

    return key;
  }).map(toColor);
  var result = Object.create(null);
  results.forEach(function(r) {
    result[r.countryName] = r.color
  })
  return result;


  function toColor(countryName) {
    var value = countries[countryName] - min;
    var colorIdx = Math.round(colors.length * value / (max - min));
    if (colorIdx === colors.length)
      colorIdx -= 1;
    var color = colors[colors.length - 1 - colorIdx]
    if (!color) {
      console.log(colors.length - colorIdx, colors.length, countryName);
    }
    return {
      countryName: countryName,
      color: color
    };
  }

  function getColors() {
    return [
      '#F5F4F2',
      '#E0DED8',
      '#CAC3B8',
      '#BAAE9A',
      '#AC9A7C',
      '#AA8753',
      '#B9985A',
      '#C3A76B',
      '#CAB982',
      '#D3CA9D',
      '#DED6A3',
      '#E8E1B6',
      '#EFEBC0',
      '#E1E4B5',
      '#D1D7AB',
      '#BDCC96',
      '#A8C68F',
      '#94BF8B',
      '#ACD0A5'
    ]
  }

  function getCountries() {
    return {
      'Afghanistan': 1884,
      'Albania': 708,
      'Algeria': 800,
      'Andorra': 1996,
      'Angola': 1112,
      'Antarctica': 2300,
      'Argentina': 595,
      'Armenia': 1792,
      'Australia': 330,
      'Austria': 910,
      'Azerbaijan': 384,
      'Bangladesh': 85,
      'Belarus': 160,
      'Belgium': 181,
      'Belize': 173,
      'Benin': 273,
      'Bhutan': 3280,
      'Bolivia': 1192,
      'Bosnia and Herzegovina': 500,
      'Botswana': 1013,
      'Brazil': 320,
      'Brunei': 478,
      'Bulgaria': 472,
      'Burkina Faso': 297,
      'Myanmar': 702,
      'Burundi': 1504,
      'Cambodia': 126,
      'Cameroon': 667,
      'Canada': 487,
      'Central African Republic': 635,
      'Chad': 543,
      'Chile': 1871,
      'China': 1840,
      'Colombia': 593,
      'Republic of the Congo': 430,
      'Democratic Republic of the Congo': 726,
      'Corsica': 568,
      'Costa Rica': 746,
      'Croatia': 331,
      'Cuba': 108,
      'Cyprus': 91,
      'Czech Republic': 433,
      'Denmark': 34,
      'Djibouti': 430,
      'Dominican Republic': 424,
      'Ecuador': 1117,
      'Egypt': 321,
      'El Salvador': 442,
      'Estonia': 61,
      'Equatorial Guinea': 577,
      'Eritrea': 853,
      'Ethiopia': 1330,
      'Finland': 164,
      'France': 375,
      'French Guiana': 168,
      'Gabon': 377,
      'Gambia': 34,
      'Georgia': 1432,
      'Germany': 263,
      'Ghana': 190,
      'Greece': 498,
      'Greenland': 1792,
      'Guatemala': 759,
      'Guinea': 472,
      'Guinea Bissau': 70,
      'Guyana': 207,
      'Haiti': 470,
      'Honduras': 684,
      'Hungary': 143,
      'Iceland': 557,
      'India': 160,
      'Indonesia': 367,
      'Iran': 1305,
      'Iraq': 312,
      'Ireland': 118,
      'Israel': 508,
      'Italy': 538,
      'Ivory Coast': 250,
      'Jamaica': 340,
      'Japan': 438,
      'Jordan': 812,
      'Kazakhstan': 387,
      'Kenya': 762,
      'Kuwait': 108,
      'Kyrgyzstan': 2988,
      'Latvia': 87,
      'Laos': 710,
      'Lebanon': 1250,
      'Lesotho': 2161,
      'Liberia': 243,
      'Libya': 423,
      'Lithuania': 110,
      'Luxembourg': 325,
      'Macedonia': 741,
      'Madagascar': 615,
      'Malawi': 779,
      'Malaysia': 538,
      'Maldives': 1.8,
      'Mali': 343,
      'Mauritania': 276,
      'Mexico': 1111,
      'Moldova': 139,
      'Mongolia': 1528,
      'Montenegro': 1086,
      'Morocco': 909,
      'Mozambique': 345,
      'Namibia': 1141,
      'Nepal': 3265,
      'Netherlands': 30,
      'New Zealand': 388,
      'Nicaragua': 298,
      'Niger': 474,
      'Nigeria': 380,
      'North Korea': 400,
      'Norway': 460,
      'Oman': 310,
      'Pakistan': 900,
      'Panama': 360,
      'Papua New Guinea': 667,
      'Paraguay': 178,
      'Peru': 1555,
      'Philippines': 442,
      'Poland': 173,
      'Portugal': 372,
      'Puerto Rico': 261,
      'Qatar': 28,
      'Romania': 414,
      'Rwanda': 1598,
      'Russia': 600,
      'Saudi Arabia': 665,
      'Senegal': 69,
      'Republic of Serbia': 442,
      'Sierra Leone': 279,
      'Slovakia': 458,
      'Slovenia': 492,
      'Somaliland': 410,
      'South Africa': 1034,
      'South Korea': 282,
      'Spain': 660,
      'Sri Lanka': 228,
      'Sudan': 568,
      'Suriname': 246,
      'Swaziland': 305,
      'Sweden': 320,
      'Switzerland': 1350,
      'Syria': 514,
      'Tajikistan': 3186,
      'Taiwan': 1150,
      'Tanzania': 1018,
      'Uganda': 1100,
      'Thailand': 287,
      'Togo': 236,
      'Trinidad and Tobago': 83,
      'Tunisia': 246,
      'Turkey': 1132,
      'Turkmenistan': 230,
      'Ukraine': 175,
      'United Arab Emirates': 149,
      'United Kingdom': 162,
      'United States': 759,
      'Uruguay': 109,
      'Venezuela': 450,
      'Vietnam': 398,
      'Western Sahara': 256,
      'Yemen': 999,
      'Zambia': 1138,
      'Zimbabwe': 961
    }
  }
}
