"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const intervalRef = useRef(null);
  const [particles, setParticles] = useState([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      [...Array(20)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        y: [0, -30, 0],
        duration: 3 + Math.random() * 2
      }))
    );
  }, []);

  const slides = [
    {
      image: "/images/slide1.jpg",
      title: "Welcome to the Future",
      subtitle: "of Work",
      message: "Connect with verified professionals in the adult content industry",
      gradient: "from-purple-600/90 to-pink-600/90"
    },
    {
      image: "/images/slide2.jpg",
      title: "Find the Best Talent",
      subtitle: "Right Here",
      message: "Browse portfolios and discover amazing creators, models, and performers",
      gradient: "from-blue-600/90 to-purple-600/90"
    },
    {
      image: "/images/slide3.jpg",
      title: "Post Jobs and Hire",
      subtitle: "Creatively",
      message: "Connect with verified talent for your next project",
      gradient: "from-pink-600/90 to-red-600/90"
    },
  ];

  // Preload images
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new window.Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      img.src = slide.image;
    });
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 6000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mx-auto overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Background Images with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 z-10">
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`}></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          {loadedImages.has(currentSlide) && (
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover object-center"
              priority={currentSlide === 0}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating particles */}
      <div className="absolute inset-0 z-5">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              y: particle.y,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: particle.left,
              top: particle.top,
            }}
          />
        ))}
      </div>

      {/* Content with Enhanced Animations */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {slides[currentSlide].title}
              <br />
              <span className="text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {slides[currentSlide].subtitle}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {slides[currentSlide].message}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <i className="fas fa-search mr-2"></i>
                Get Started
              </motion.button>

              <motion.button
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm bg-white/10"
                whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <i className="fas fa-play mr-2"></i>
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30">
        <motion.button
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-4 rounded-full text-white text-xl border border-white/20"
          onClick={prevSlide}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <i className="fas fa-chevron-left"></i>
        </motion.button>
      </div>

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30">
        <motion.button
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-4 rounded-full text-white text-xl border border-white/20"
          onClick={nextSlide}
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <i className="fas fa-chevron-right"></i>
        </motion.button>
      </div>

      {/* Play/Pause Control */}
      <div className="absolute top-6 right-6 z-30">
        <motion.button
          className="bg-black/50 hover:bg-black/70 backdrop-blur-sm p-3 rounded-full text-white border border-white/20"
          onClick={togglePlayPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full border-2 border-white/50 transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/20'
              }`}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              animate={{
                scale: index === currentSlide ? 1.2 : 1,
                backgroundColor: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: isPlaying ? 6 : 0,
            ease: "linear",
            repeat: isPlaying ? Infinity : 0,
          }}
          key={`${currentSlide}-${isPlaying}`}
        />
      </div>
    </section>
  );
};

export default HeroSection;