// Simple singleton to hold data that is too large to pass via navigation params (like base64 images)
let storage = {};

export const setTempData = (key, value) => {
  storage[key] = value;
};

export const getTempData = (key) => {
  return storage[key];
};

export const clearTempData = (key) => {
  delete storage[key];
};
