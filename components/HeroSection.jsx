import { useState, useEffect } from "react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "/images/slide1.jpg",
      message: "Welcome to the Future of Work",
    },
    {
      image: "/images/slide2.jpg",
      message: "Find the Best Talent Right Here",
    },
    {
      image: "/images/slide3.jpg",
      message: "Post Jobs and Hire Creatively",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, [slides.length]);

  return (
    <section className="relative w-full h-[500px] mx-auto px-4 sm:px-8 overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${slides[currentSlide].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="absolute inset-0 flex items-end justify-center text-white text-center p-8">
        <h1 className="text-5xl font-bold">{slides[currentSlide].message}</h1>
      </div>

      {/* Optional: Add controls for manual slide navigation */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <button
          className="bg-black p-2 rounded-full text-white"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        >
          {'<'}
        </button>
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <button
          className="bg-black p-2 rounded-full text-white"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        >
          {'>'}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
