/*************************************************************************************
 * WEB322 - 2237 Project
 * I declare that this assignment is my own work in accordance with the Seneca Academic
 * Policy. No part of this assignment has been copied manually or electronically from
 * any other source (including web sites) or distributed to other students.
 *
 * Student Name  : Jigar Patel
 * Student ID    : 118005172
 * Course/Section: WEB322 NEE
 *
 **************************************************************************************/

// Array to store rental objects
const rentals = [
  {
    headline: "Muskoka Lakeside Glamping Retreat",
    numSleeps: 2,
    numBedrooms: 1,
    numBathrooms: 1,
    pricePerNight: 249.99,
    city: "Muskoka",
    province: "Ontario",
    imageUrl: "/assets/muskoka-lake-glamping.jpg",
    featuredRental: false,
  },
  {
    headline: "Haliburton Cozy Cottage Getaway",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 179.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/cottage-haliburton.jpg",
    featuredRental: true,
  },
  {
    headline: "North Bay Lakeside Cabin Retreat",
    numSleeps: 6,
    numBedrooms: 3,
    numBathrooms: 2,
    pricePerNight: 299.99,
    city: "North Bay",
    province: "Ontario",
    imageUrl: "/assets/cabin-north-bay.jpg",
    featuredRental: false,
  },
  {
    headline: "Tranquil Muskoka Waterfront Cottage",
    numSleeps: 5,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 219.99,
    city: "Muskoka",
    province: "Ontario",
    imageUrl: "/assets/cottage-muskoka.jpg",
    featuredRental: true,
  },
  {
    headline: "Haliburton Forest Retreat Cabin",
    numSleeps: 4,
    numBedrooms: 2,
    numBathrooms: 1,
    pricePerNight: 189.99,
    city: "Haliburton",
    province: "Ontario",
    imageUrl: "/assets/cabin-haliburton.jpg",
    featuredRental: false,
  },
  {
    headline: "North Bay Lakeside Luxury Lodge",
    numSleeps: 8,
    numBedrooms: 4,
    numBathrooms: 3,
    pricePerNight: 399.99,
    city: "North Bay",
    province: "Ontario",
    imageUrl: "/assets/lodge-north-bay.jpg",
    featuredRental: true,
  },
];

// Function to get featured rentals
function getFeaturedRentals() {
  return rentals.filter((rental) => rental.featuredRental);
}

// Function to get rentals by city and province
function getRentalsByCityAndProvince() {
    const groupedRentals = {};
  
    rentals.forEach((rental) => {
      const cityProvince = `${rental.city}, ${rental.province}`;
  
      if (!groupedRentals[cityProvince]) {
        groupedRentals[cityProvince] = {
          cityProvince,
          rentals: [],
        };
      }
  
      // Include the city and province within each rental
      const rentalWithLocation = {
        ...rental,
        city: rental.city,
        province: rental.province,
      };
  
      groupedRentals[cityProvince].rentals.push(rentalWithLocation);
    });
  
    return Object.values(groupedRentals);
  }

module.exports = {
  getFeaturedRentals,
  getRentalsByCityAndProvince,
};
