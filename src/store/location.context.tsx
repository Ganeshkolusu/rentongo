import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  currentCity: string;
  currentCountry: string;
  coordinates: Coordinates;
  setLocation: (city: string, country?: string) => void;
  setCoordinates: (coords: Coordinates) => void;
  setLocationWithCoordinates: (city: string, coords: Coordinates, country?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

// Default coordinates for Kakinada
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 16.9891,
  longitude: 82.2475,
};

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<string>(() => {
    return localStorage.getItem('currentCity') || 'location';
  });
  const [currentCountry, setCurrentCountry] = useState<string>(() => {
    return localStorage.getItem('currentCountry') || 'India';
  });
  const [coordinates, setCoordinatesState] = useState<Coordinates>(() => {
    const savedCoords = localStorage.getItem('coordinates');
    return savedCoords ? JSON.parse(savedCoords) : DEFAULT_COORDINATES;
  });

  useEffect(() => {
    localStorage.setItem('currentCity', currentCity);
    localStorage.setItem('currentCountry', currentCountry);
    localStorage.setItem('coordinates', JSON.stringify(coordinates));
  }, [currentCity, currentCountry, coordinates]);

  const setLocation = (city: string, country?: string) => {
    setCurrentCity(city);
    setCurrentCountry(country || 'India');
  };

  const setCoordinates = (coords: Coordinates) => {
    setCoordinatesState(coords);
  };

  const setLocationWithCoordinates = (city: string, coords: Coordinates, country?: string) => {
    setCurrentCity(city);
    setCurrentCountry(country || 'India');
    setCoordinatesState(coords);
  };

  return (
    <LocationContext.Provider 
      value={{ 
        currentCity, 
        currentCountry, 
        coordinates, 
        setLocation, 
        setCoordinates,
        setLocationWithCoordinates 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};