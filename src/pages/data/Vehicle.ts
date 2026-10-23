
import { Vehicle } from "../../types/Vehicle";
import BlackCar from "../../assets/images/BlackCar.png";
// import AutoImage from "../../assets/images/Auto.png";
import Enfied from "../../assets/images/Enfield.png";
import yamaha from "../../assets/images/yamaha.png";
import TVS from "../../assets/images/tvs-ntorq.png";
import Activa from "../../assets/images/Activa.png";
export const vehicles: Vehicle[] = [
  {
    id: "1",
    name: "Hyundai Verna",
    price: 250,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.2,

    image: BlackCar,

    type: "Car",
    location: "Kakinada",
    available: true,
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "2",
    name: "Maruti Swift",
    price: 180,
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    rating: 4.0,

    image: BlackCar,

    type: "Car",
    location:  "Hyderabad",
    available: true,
      description: "Compact hatchback perfect for city rides."
  },
  // {
  //   id: "3",
  //   name: "Bajaj RE",
  //   price: 150,
  //   seats: 3,
  //   transmission: "Manual",
  //   fuel: "CNG",
  //   rating: 4.0,

  //   image:AutoImage,

  //   type: "auto",
  //   location:  "Kakinada",
  //   available: true,
  //    description: "Compact hatchback perfect for city rides."
  // },
  // {
  //   id: "4",
  //   name: "Piaggio Ape",
  //   price: 160,
  //   seats: 3,
  //   transmission: "Manual",
  //   fuel: "Diesel",
  //   rating: 4.3,

  //   image: AutoImage,

  //   type: "auto",
  //   location:  "Kakinada",
  //   available: false,
  //     description: "Compact hatchback perfect for city rides."
  // },
  {
    id: "5",
    name: "Honda City",
    price: 300,
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    rating: 4.5,

    image: BlackCar,

    type: "Car",
    location:  "Hyderabad",
    available: true,
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "6",
    name: "Toyota Innova",
    price: 450,
    seats: 7,
    transmission: "Manual",
    fuel: "Diesel",
    rating: 4.7,

    image: BlackCar,

    type: "Car",
    location: "Bangalore",
    available: true,
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "7",
    name: "Mahindra XUV500",
    price: 400,
    seats: 7,
    transmission: "Automatic",
    fuel: "Diesel",
    rating: 4.4,

    image: BlackCar,

    type: "Car",
    location: "kakinada",
    available: true,
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "8",
    name: "Tata Nexon",
    price: 220,
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    rating: 4.3,

    image: BlackCar,
  description: "Compact hatchback perfect for city rides",
   
    location: "Hyderabad",
    available: true,
     type: "Car",
  },

  // {
  //   id: "9",
  //   name: "Bajaj RE",
  //   price: 150,
  //   transmission: "Manual",
  //   fuel: "CNG",
  //   seats: 3,
  //   location: "Hyderabad",
  //   rating: 4.0,
  //   available: true,
  //   type: "auto",
  //   image: AutoImage,
  //     description: "Compact hatchback perfect for city rides."
  // },
  // {
  //   id: "10",
  //   name: "Piaggio Ape",
  //   price: 160,
  //   transmission: "Manual",
  //   fuel: "Diesel",
  //   seats: 3,
  //   location: "Rajahmundry",
  //   rating: 4.3,
  //   available: true,
  //   type: "auto",
  //   image: AutoImage,
  //     description: "Compact hatchback perfect for city rides."
  // },
  // {
  //   id: "11",
  //   name: "TVS King",
  //   price: 155,
  //   transmission: "Manual",
  //   fuel: "CNG",
  //   seats: 3,
  //   location: "Vijayawada",
  //   rating: 4.1,
  //   available: true,
  //   type: "auto",
  //   image: AutoImage,
  //     description: "Compact hatchback perfect for city rides."
  // },
  // {
  //   id: "12",
  //   name: "Mahindra Alfa",
  //   price: 165,
  //   transmission: "Manual",
  //   fuel: "Diesel",
  //   seats: 3,
  //   location: "Visakhapatnam",
  //   rating: 4.4,
  //   available: true,
  //   type: "auto",
  //   image: AutoImage,
  //     description: "Compact hatchback perfect for city rides."
  // },
   {
    id: "13",
  name: "Royal Enfield ",
  price: 120,
  transmission: "Manual",
  fuel: "Petrol",
  seats: 2,
  location: "Kakinada",
  rating: 4.6,
  available: true,
  image: Enfied, // ✅ corrected
  type: "Bike",
    description: "Compact hatchback perfect for city rides."
  },
  {
    id: "14",
    name: "Yamaha FZ-S",
    price: 100,
    transmission: "Manual",
    fuel: "Petrol",
    seats: 2,
    location: "Rajahmundry",
    rating: 4.4,
    available: true,
    image: yamaha,
    type: "Bike",
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "15",
    name: "TVS Ntorq",
    price: 90,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 2,
    location: "Kakinada",
    rating: 4.3,
    available: true,
    image: TVS,
    type: "Bike",
      description: "Compact hatchback perfect for city rides."
  },
  {
    id: "16",
    name: "Honda Activa 6G",
    price: 80,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 2,
    location: "Vijayawada",
    rating: 4.6,
    available: true,
    image: Activa,
    type: "Bike",
      description: "Compact hatchback perfect for city rides."
  },
];


