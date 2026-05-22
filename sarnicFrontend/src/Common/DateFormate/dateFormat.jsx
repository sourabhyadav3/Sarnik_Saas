// Helper function to format date to DD-MM-YYYY
export const formatDDMMYYYY = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

// Helper function to convert any date format to DD-MM-YYYY
export const convertToDDMMYYYY = (dateValue) => {
  if (!dateValue) return "";

  // First, check if it's in YYYY-MM-DD format
  if (dateValue.includes("-")) {
    const [yyyy, mm, dd] = dateValue.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }

  // If it's already in DD-MM-YYYY, return as is
  if (dateValue.split("-").length === 3) {
    return dateValue; // If the format is DD-MM-YYYY, return it
  }

  // If it's in MM-DD-YYYY format, convert it
  const [mm, dd, yyyy] = dateValue.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

// Helper function to convert from DD-MM-YYYY to YYYY-MM-DD format
export const convertToISOFormat = (dateValue) => {
  if (!dateValue) return "";

  // Check if the date is in DD-MM-YYYY format
  const [dd, mm, yyyy] = dateValue.split("-");
  if (yyyy && mm && dd) {
    return `${yyyy}-${mm}-${dd}`; // Return in YYYY-MM-DD format
  }

  return dateValue; // If already in YYYY-MM-DD format, no change needed
};

// Helper function to convert from MM-DD-YYYY format to DD-MM-YYYY format
export const convertFromMMDDYYYY = (dateValue) => {
  if (!dateValue) return "";

  // Check if the date is in MM-DD-YYYY format
  const [mm, dd, yyyy] = dateValue.split("-");
  if (yyyy && mm && dd) {
    return `${dd}-${mm}-${yyyy}`; // Convert to DD-MM-YYYY format
  }

  return dateValue; // Return as is if it is already in the correct format
};
