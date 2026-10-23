import React from "react";
import Carousel from "./ui/Carousel";
import slideImage from "../assets/images/slides.png";
import Car from "../assets/icons/Car.png"
import Auto from "../assets/icons/Auto.png";
import Bike from "../assets/icons/BikeLogo.png";

interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
  // backgroundColor: string;
  textColor: string;
  onButtonClick: () => void;
}

interface PromoSlidesProps {
  className?: string;
}

const PromoSlides: React.FC<PromoSlidesProps> = ({ className = "" }) => {
  const slides: PromoSlide[] = [
    {
      id: "1",
      title: "🚗 Premium Cars",
      subtitle: "Luxury at Your Fingertips",
      description: "Experience premium vehicles with comfort and style. Book now and get 20% off your first ride!",
      buttonText: "Book Premium Cars",
      backgroundImage: slideImage,
      // backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textColor: "text-white",
      onButtonClick: () => window.location.href = "/listed",
    },
    {
      id: "2",
      title: "🛺 Quick Autos",
      subtitle: "Fast & Affordable",
      description: "Need a quick ride around the city? Our autos are perfect for short distances and budget-friendly trips.",
      buttonText: "Find Autos",
      backgroundImage: slideImage,
      // backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      textColor: "text-white",
      onButtonClick: () => window.location.href = "/auto",
    },
    {
      id: "3",
      title: "⏰ 24/7 Service",
      subtitle: "Always Available",
      description: "Round-the-clock service with instant booking. Your ride is just a tap away, anytime, anywhere.",
      buttonText: "Book Now",
      backgroundImage: slideImage,
      // backgroundColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      textColor: "text-white",
      onButtonClick: () => window.location.href = "/rental",
    },
    {
      id: "4",
      title: "🎯 Special Offers",
      subtitle: "Limited Time Deals",
      description: "Get amazing discounts on weekend bookings. Save up to 30% on your next adventure!",
      buttonText: "View Offers",
      backgroundImage: slideImage,
      // backgroundColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      textColor: "text-white",
      onButtonClick: () => alert("Special offers coming soon!"),
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <Carousel
        autoplay={true}
        autoplayDelay={4000}
        showDots={true}
        showArrows={true}
        className="h-80 rounded-xl shadow-lg"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative h-80 flex items-center justify-center overflow-hidden rounded-xl"
          // style={{ background: slide.backgroundColor }}
          >
            {slide.backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center "
                style={{
                  backgroundImage: `url(${slide.backgroundImage})`,
                  backgroundBlendMode: 'overlay'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            <div className="relative z-10 text-center px-8 max-w-2xl">
              <div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${slide.textColor} tracking-wide`}>
                  RENTONGOVEHICLE – Smart
                </h1>
                <h2 className={`text-3xl md:text-4xl font-bold ${slide.textColor} tracking-wide`}>
                  Car Rentals & Listings
                </h2>
                <h6 className={`text-sm  ${slide.textColor} tracking-wide`}>Rent or List Vehicles Effortlessly. Anywhere, Anytime.</h6>
                <h6 className={`text-sm ${slide.textColor} tracking-wide flex items-center justify-center gap-2`}>
                  <img src={Car} alt="Car" className="w-6 h-6" />
                  Car’s Bookings & Listings
                  <span className="mx-1">|</span>
                  <img src={Bike} alt="Bike" className="w-6 h-6" />
                  Bike Bookings
                </h6>

              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default PromoSlides;
