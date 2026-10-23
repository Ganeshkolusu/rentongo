// src/pages/EditCarDetails.tsx
import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BlackCar from "../assets/images/BlackCar.png";

// ✅ Zustand Stores
import { useVehicleStore } from "../store/vehicle.store";
import { useListedCarsStore } from "../store/listedCars.store";
import { useListedBikesStore } from "../store/listedBikes.store";

interface VehicleDetails {
  id?: string;
  name: string;
  number:string;
  price: string;
  transmission: string;
  seats: string;
  fuel: string;
  ac: boolean;
  rating: string;
  image: string;
  description: string;
  location: {
    state: string;
    district: string;
    city: string;
    pincode: string;
    street: string;
  };
  documents: {
    drivingLicense: boolean;
    aadharCard: boolean;
    depositVehicle: boolean;
    depositMoney: string;
  };
  createdAt?: number;
}

const defaultVehicle: VehicleDetails = {
  id: undefined,
  name: "Hyundai Verna",
  number:"Ap234",
  price: "250",
  transmission: "Automatic",
  seats: "5 Seaters",
  fuel: "Petrol",
  ac: true,
  rating: "4.2",
  image: BlackCar,
  description: "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
  location: {
    state: "Andhra Pradesh",
    district: "East Godavari",
    city: "Kakinada",
    pincode: "533001",
    street: "Gandhi Nagar",
  },
  documents: {
    drivingLicense: true,
    aadharCard: true,
    depositVehicle: true,
    depositMoney: "10000",
  },
  createdAt: Date.now(),
};

const EditCarDetails: React.FC = () => {
  const { vehicleName } = useParams<{ vehicleName: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { getVehicleByName, updateVehicle, deleteVehicle, addVehicle } = useVehicleStore();
  const { cars, updateCar, deleteCar } = useListedCarsStore();
  const { bikes, updateBike, deleteBike } = useListedBikesStore();

  // Check if navigation state has vehicle
  const vehicleFromState = location.state?.carData;

  const [vehicleData, setVehicleData] = useState<VehicleDetails>(() => {
    if (vehicleFromState) return vehicleFromState;

    // Lookup in vehicle store
    const storedVehicle = getVehicleByName(vehicleName || "");
    if (storedVehicle) return storedVehicle;

    // Lookup in cars store
    const car = cars.find(c => c.carName === vehicleName);
    if (car) {
      return {
        id: car.id,
        name: car.carName,
        number: car.carNumber,
        price: car.rentPrice,
        transmission: car.transmission,
        seats: "5 Seaters",
        fuel: car.fuel,
        ac: car.acAvailable,
        rating: car.rating?.toString() || "4.0",
        image: car.photos[0] || BlackCar,
        description: car.description,
        location: {
          state: car.state,
          district: car.state,
          city: car.city,
          pincode: car.pincode,
          street: car.street,
        },
        documents: {
          drivingLicense: car.drivingLicense,
          aadharCard: car.aadharCard,
          depositVehicle: car.depositVehicle,
          depositMoney: car.depositMoney,
        },
        createdAt: Date.now(),
      };
    }

    // Lookup in bikes store
    const bike = bikes.find(b => b.vehicleName === vehicleName);
    if (bike) {
      return {
        id: bike.id,
        name: bike.vehicleName,
        price: bike.farePrice,
        transmission: bike.transmission || "Manual",
        seats: "2 Seaters",
        fuel: bike.fuel || "Petrol",
        ac: false,
        rating: bike.rating?.toString() || "4.0",
        image: bike.photos[0] || BlackCar,
        description: bike.description || "",
        location: {
          state: bike.state || "",
          district: bike.state || "",
          city: bike.city || "",
          pincode: bike.pincode || "",
          street: bike.street || "",
        },
        documents: {
          drivingLicense: bike.drivingLicense ?? false,
          aadharCard: bike.aadharCard ?? false,
          depositVehicle: bike.depositVehicle ?? false,
          depositMoney: bike.depositMoney || "0",
        },
        createdAt: bike.createdAt ? new Date(bike.createdAt).getTime() : Date.now(),
      };
    }

    return defaultVehicle;
  });

  // Handlers
  const handleInputChange = (field: keyof VehicleDetails, value: any) =>
    setVehicleData(prev => ({ ...prev, [field]: value }));

  const handleLocationChange = (field: keyof VehicleDetails["location"], value: string) =>
    setVehicleData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));

  const handleDocumentChange = (field: keyof VehicleDetails["documents"], value: any) =>
    setVehicleData(prev => ({ ...prev, documents: { ...prev.documents, [field]: value } }));

  const handleSave = () => {
    const vehicleId = vehicleData.id;
    if (!vehicleId) {
      addVehicle({ ...vehicleData, type: "car" });
      alert("Vehicle added successfully!");
      navigate("/listed");
      return;
    }

    // Update in the correct store
    if (cars.find(c => c.id === vehicleId)) {
      updateCar(vehicleId, {
        carName: vehicleData.name,
        rentPrice: vehicleData.price,
        transmission: vehicleData.transmission,
        fuel: vehicleData.fuel,
        acAvailable: vehicleData.ac,
        description: vehicleData.description,
        state: vehicleData.location.state,
        city: vehicleData.location.city,
        pincode: vehicleData.location.pincode,
        street: vehicleData.location.street,
        drivingLicense: vehicleData.documents.drivingLicense,
        aadharCard: vehicleData.documents.aadharCard,
        depositVehicle: vehicleData.documents.depositVehicle,
        depositMoney: vehicleData.documents.depositMoney,
      });
    } else if (bikes.find(b => b.id === vehicleId)) {
      updateBike(vehicleId, {
        vehicleName: vehicleData.name,
        farePrice: vehicleData.price,
        transmission: vehicleData.transmission,
        fuel: vehicleData.fuel,
        description: vehicleData.description,
        state: vehicleData.location.state,
        city: vehicleData.location.city,
        pincode: vehicleData.location.pincode,
        street: vehicleData.location.street,
        drivingLicense: vehicleData.documents.drivingLicense,
        aadharCard: vehicleData.documents.aadharCard,
        depositVehicle: vehicleData.documents.depositVehicle,
        depositMoney: vehicleData.documents.depositMoney,
      });
    } else {
      updateVehicle(vehicleId, vehicleData);
    }

    alert("Vehicle details saved successfully!");
    navigate(-1);
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    const vehicleId = vehicleData.id;
    if (!vehicleId) return;

    if (cars.find(c => c.id === vehicleId)) deleteCar(vehicleId);
    else if (bikes.find(b => b.id === vehicleId)) deleteBike(vehicleId);
    else deleteVehicle(vehicleId);

    alert("Vehicle deleted successfully!");
    navigate("/listed");
  };

  const handleAddPhoto = () => {
    alert("Add photo functionality — file picker would open here.");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Edit Vehicle Details</h1>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700">Name</label>
        <input
          className="border p-2 w-full"
          value={vehicleData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-gray-700">Price</label>
        <input
          className="border p-2 w-full"
          value={vehicleData.price}
          onChange={(e) => handleInputChange("price", e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-700">Description</label>
        <textarea
          className="border p-2 w-full"
          value={vehicleData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <input
          className="border p-2"
          placeholder="State"
          value={vehicleData.location.state}
          onChange={(e) => handleLocationChange("state", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="City"
          value={vehicleData.location.city}
          onChange={(e) => handleLocationChange("city", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="District"
          value={vehicleData.location.district}
          onChange={(e) => handleLocationChange("district", e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Pincode"
          value={vehicleData.location.pincode}
          onChange={(e) => handleLocationChange("pincode", e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddPhoto}
        >
          Add Photo
        </button>
      </div>
    </div>
  );
};

export default EditCarDetails;

