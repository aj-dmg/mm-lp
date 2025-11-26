
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  // List of abbreviations to keep in uppercase
  const exceptions = ['SE', 'SW', 'NE', 'NW', 'AB'];
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // If the word is an exception, uppercase it
      if (exceptions.includes(word.toUpperCase().replace(/,$/, ''))) {
        return word.toUpperCase();
      }
      // Otherwise, capitalize the first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};
