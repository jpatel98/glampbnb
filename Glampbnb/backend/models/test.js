const { getRentalsByCityAndProvince } = require('./rentals-db');

const rentalsByCityAndProvince = getRentalsByCityAndProvince();

console.log(JSON.stringify(rentalsByCityAndProvince, null, 2));
