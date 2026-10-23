import React from "react";
import CarCard from "./ui/VehicleCard";
import { Vehicle } from "../types/Vehicle";

interface Props {
  vehicles: Vehicle[];
}

const AutoCarousel: React.FC<Props> = ({ vehicles }) => {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4">
      {vehicles.map((v) => (
        <CarCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
};

export default AutoCarousel;
