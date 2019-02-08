export default (number, numOfDecPlaces = 2) => {
  const power = Math.pow(10, numOfDecPlaces);
  return Math.round(number * power) / power;
};