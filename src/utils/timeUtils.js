export const updateTimestamp = (storageKey) => {
  const isoString = new Date().toISOString();
  localStorage.setItem(`lastUpdated_${storageKey}`, isoString);
  window.dispatchEvent(new CustomEvent(`timestampUpdated_${storageKey}`));
};
