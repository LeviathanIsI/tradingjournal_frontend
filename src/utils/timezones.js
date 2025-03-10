// components/Dashboard/utils/timezones.js

/**
 * Determines if a specific date is in Daylight Saving Time for a timezone
 * @param {string} timezone - The timezone to check
 * @param {Date} date - The date to check
 * @returns {boolean} True if the date is in DST
 */
export const isDaylightSavingTime = (timezone, date = new Date()) => {
  if (!timezone) return false;

  try {
    // Create two dates in January and July (winter and summer)
    const jan = new Date(date.getFullYear(), 0, 1).getTime();
    const jul = new Date(date.getFullYear(), 6, 1).getTime();

    // Get timezone offsets for both dates
    const janOffset = getTimezoneOffset(timezone, new Date(jan));
    const julOffset = getTimezoneOffset(timezone, new Date(jul));

    // If they're different, there's DST in this timezone
    // Then check if current date's offset matches the summer or winter offset
    if (janOffset !== julOffset) {
      const currentOffset = getTimezoneOffset(timezone, date);

      // In northern hemisphere, summer has the greater offset
      // In southern hemisphere, winter has the greater offset
      // We just need to check if current offset doesn't match January's offset
      return currentOffset !== janOffset;
    }

    return false;
  } catch (error) {
    console.error("Error detecting DST:", error);
    return false;
  }
};

/**
 * Gets the timezone offset in minutes for a specific date and timezone
 * @param {string} timezone - The timezone
 * @param {Date} date - The date to check
 * @returns {number} Timezone offset in minutes
 */
const getTimezoneOffset = (timezone, date) => {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (utcDate - tzDate) / 60000;
};

/**
 * Maps common timezone identifiers to their standard abbreviations, accounting for DST
 * @param {string} timezone - The timezone identifier to convert
 * @param {Date} [date=new Date()] - The date to check DST status (defaults to current date)
 * @returns {string} The timezone abbreviation or original string if not found
 */
export const getTimezoneAbbreviation = (timezone, date = new Date()) => {
  if (!timezone) return "UTC";

  // Check if the timezone is in DST for the given date
  const isDST = isDaylightSavingTime(timezone, date);

  // Map of common timezones to their abbreviations, with DST handling
  const timezoneMap = {
    // North America
    "America/New_York": isDST ? "EDT" : "EST",
    "America/Detroit": isDST ? "EDT" : "EST",
    "America/Toronto": isDST ? "EDT" : "EST",
    "America/Chicago": isDST ? "CDT" : "CST",
    "America/Mexico_City": isDST ? "CDT" : "CST",
    "America/Denver": isDST ? "MDT" : "MST",
    "America/Phoenix": "MST", // Arizona doesn't use DST
    "America/Los_Angeles": isDST ? "PDT" : "PST",
    "America/Vancouver": isDST ? "PDT" : "PST",
    "America/Anchorage": isDST ? "AKDT" : "AKST",
    "America/Juneau": isDST ? "AKDT" : "AKST",
    "America/Honolulu": "HST", // Hawaii doesn't use DST
    "America/Halifax": isDST ? "ADT" : "AST",
    "America/St_Johns": isDST ? "NDT" : "NST",

    // Europe
    "Europe/London": isDST ? "BST" : "GMT",
    "Europe/Dublin": isDST ? "IST" : "GMT", // Irish Summer Time
    "Europe/Lisbon": isDST ? "WEST" : "WET",
    "Europe/Paris": isDST ? "CEST" : "CET",
    "Europe/Berlin": isDST ? "CEST" : "CET",
    "Europe/Madrid": isDST ? "CEST" : "CET",
    "Europe/Rome": isDST ? "CEST" : "CET",
    "Europe/Vienna": isDST ? "CEST" : "CET",
    "Europe/Amsterdam": isDST ? "CEST" : "CET",
    "Europe/Brussels": isDST ? "CEST" : "CET",
    "Europe/Stockholm": isDST ? "CEST" : "CET",
    "Europe/Zurich": isDST ? "CEST" : "CET",
    "Europe/Athens": isDST ? "EEST" : "EET",
    "Europe/Helsinki": isDST ? "EEST" : "EET",
    "Europe/Sofia": isDST ? "EEST" : "EET",
    "Europe/Istanbul": isDST ? "EEST" : "TRT",
    "Europe/Moscow": "MSK", // Russia stopped using DST

    // Asia (most don't use DST)
    "Asia/Dubai": "GST",
    "Asia/Muscat": "GST",
    "Asia/Riyadh": "AST", // Arabian Standard Time
    "Asia/Qatar": "AST", // Arabian Standard Time
    "Asia/Kuwait": "AST", // Arabian Standard Time
    "Asia/Tehran": isDST ? "IRDT" : "IRST",
    "Asia/Karachi": "PKT",
    "Asia/Kolkata": "IST",
    "Asia/Dhaka": "BST", // Bangladesh Standard Time
    "Asia/Bangkok": "ICT",
    "Asia/Jakarta": "WIB",
    "Asia/Singapore": "SGT",
    "Asia/Kuala_Lumpur": "MYT",
    "Asia/Manila": "PHT",
    "Asia/Hong_Kong": "HKT",
    "Asia/Shanghai": "CST", // China Standard Time
    "Asia/Taipei": "CST", // China Standard Time
    "Asia/Seoul": "KST",
    "Asia/Tokyo": "JST",

    // Australia and Pacific
    "Australia/Perth": isDST ? "AWDT" : "AWST",
    "Australia/Darwin": "ACST", // Northern Territory doesn't use DST
    "Australia/Adelaide": isDST ? "ACDT" : "ACST",
    "Australia/Brisbane": "AEST", // Queensland doesn't use DST
    "Australia/Sydney": isDST ? "AEDT" : "AEST",
    "Australia/Melbourne": isDST ? "AEDT" : "AEST",
    "Australia/Hobart": isDST ? "AEDT" : "AEST",
    "Pacific/Auckland": isDST ? "NZDT" : "NZST",
    "Pacific/Fiji": isDST ? "FJST" : "FJT",

    // South America
    "America/Sao_Paulo": isDST ? "BRST" : "BRT",
    "America/Argentina/Buenos_Aires": "ART", // Argentina stopped using DST
    "America/Santiago": isDST ? "CLST" : "CLT",
    "America/Lima": "PET", // Peru doesn't use DST
    "America/Bogota": "COT", // Colombia doesn't use DST
    "America/Caracas": "VET", // Venezuela doesn't use DST

    // Africa (most don't use DST)
    "Africa/Cairo": isDST ? "EEST" : "EET",
    "Africa/Johannesburg": "SAST", // South Africa doesn't use DST
    "Africa/Lagos": "WAT",
    "Africa/Nairobi": "EAT",

    // UTC
    UTC: "UTC",
    "Etc/UTC": "UTC",
    "Etc/GMT": "UTC",
  };

  return timezoneMap[timezone] || timezone;
};

/**
 * Maps timezone abbreviations to their full names for display
 * @param {string} abbreviation - The timezone abbreviation
 * @returns {string} The full timezone name
 */
export const getTimezoneFullName = (abbreviation) => {
  const fullNameMap = {
    // North America Standard
    EST: "Eastern Standard Time",
    CST: "Central Standard Time",
    MST: "Mountain Standard Time",
    PST: "Pacific Standard Time",
    AKST: "Alaska Standard Time",
    HST: "Hawaii Standard Time",
    AST: "Atlantic Standard Time",
    NST: "Newfoundland Standard Time",

    // North America Daylight
    EDT: "Eastern Daylight Time",
    CDT: "Central Daylight Time",
    MDT: "Mountain Daylight Time",
    PDT: "Pacific Daylight Time",
    AKDT: "Alaska Daylight Time",
    ADT: "Atlantic Daylight Time",
    NDT: "Newfoundland Daylight Time",

    // Europe Standard
    GMT: "Greenwich Mean Time",
    WET: "Western European Time",
    CET: "Central European Time",
    EET: "Eastern European Time",
    TRT: "Turkey Time",
    MSK: "Moscow Standard Time",

    // Europe Daylight
    BST: "British Summer Time",
    IST: "Irish Standard Time",
    WEST: "Western European Summer Time",
    CEST: "Central European Summer Time",
    EEST: "Eastern European Summer Time",

    // Asia
    GST: "Gulf Standard Time",
    PKT: "Pakistan Standard Time",
    IST: "Indian Standard Time",
    BST: "Bangladesh Standard Time",
    ICT: "Indochina Time",
    WIB: "Western Indonesian Time",
    SGT: "Singapore Time",
    MYT: "Malaysia Time",
    PHT: "Philippine Time",
    HKT: "Hong Kong Time",
    CST: "China Standard Time",
    KST: "Korea Standard Time",
    JST: "Japan Standard Time",
    IRST: "Iran Standard Time",
    IRDT: "Iran Daylight Time",

    // Australia and Pacific Standard
    AWST: "Australian Western Standard Time",
    ACST: "Australian Central Standard Time",
    AEST: "Australian Eastern Standard Time",
    NZST: "New Zealand Standard Time",
    FJT: "Fiji Time",

    // Australia and Pacific Daylight
    AWDT: "Australian Western Daylight Time",
    ACDT: "Australian Central Daylight Time",
    AEDT: "Australian Eastern Daylight Time",
    NZDT: "New Zealand Daylight Time",
    FJST: "Fiji Summer Time",

    // South America
    BRT: "Brasilia Time",
    BRST: "Brasilia Summer Time",
    ART: "Argentina Time",
    CLT: "Chile Standard Time",
    CLST: "Chile Summer Time",
    PET: "Peru Time",
    COT: "Colombia Time",
    VET: "Venezuela Time",

    // Africa
    SAST: "South Africa Standard Time",
    WAT: "West Africa Time",
    EAT: "East Africa Time",

    // UTC
    UTC: "Coordinated Universal Time",
  };

  return fullNameMap[abbreviation] || abbreviation;
};

/**
 * Gets a user-friendly timezone display string
 * @param {string} timezone - The timezone identifier
 * @param {Date} [date=new Date()] - The date to check DST status
 * @returns {string} A user-friendly timezone display string
 */
export const getUserFriendlyTimezone = (timezone, date = new Date()) => {
  const abbreviation = getTimezoneAbbreviation(timezone, date);
  return `${abbreviation} (${getTimezoneFullName(abbreviation)})`;
};

// Common timezone options for dropdown selects, dynamically showing current abbreviation
export const getTimezoneOptions = (date = new Date()) => [
  {
    value: "America/New_York",
    label: `${getTimezoneAbbreviation(
      "America/New_York",
      date
    )} - Eastern Time`,
  },
  {
    value: "America/Chicago",
    label: `${getTimezoneAbbreviation("America/Chicago", date)} - Central Time`,
  },
  {
    value: "America/Denver",
    label: `${getTimezoneAbbreviation("America/Denver", date)} - Mountain Time`,
  },
  { value: "America/Phoenix", label: "MST - Arizona (no DST)" },
  {
    value: "America/Los_Angeles",
    label: `${getTimezoneAbbreviation(
      "America/Los_Angeles",
      date
    )} - Pacific Time`,
  },
  {
    value: "America/Anchorage",
    label: `${getTimezoneAbbreviation(
      "America/Anchorage",
      date
    )} - Alaska Time`,
  },
  { value: "America/Honolulu", label: "HST - Hawaii Time" },
  {
    value: "Europe/London",
    label: `${getTimezoneAbbreviation("Europe/London", date)} - UK Time`,
  },
  {
    value: "Europe/Paris",
    label: `${getTimezoneAbbreviation(
      "Europe/Paris",
      date
    )} - Central European Time`,
  },
  {
    value: "Europe/Athens",
    label: `${getTimezoneAbbreviation(
      "Europe/Athens",
      date
    )} - Eastern European Time`,
  },
  { value: "Asia/Dubai", label: "GST - Gulf Standard Time" },
  { value: "Asia/Kolkata", label: "IST - India Standard Time" },
  { value: "Asia/Singapore", label: "SGT - Singapore Time" },
  { value: "Asia/Tokyo", label: "JST - Japan Standard Time" },
  {
    value: "Australia/Sydney",
    label: `${getTimezoneAbbreviation(
      "Australia/Sydney",
      date
    )} - Australian Eastern Time`,
  },
  {
    value: "Pacific/Auckland",
    label: `${getTimezoneAbbreviation(
      "Pacific/Auckland",
      date
    )} - New Zealand Time`,
  },
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
];

// For backward compatibility
export const timezoneOptions = getTimezoneOptions();
