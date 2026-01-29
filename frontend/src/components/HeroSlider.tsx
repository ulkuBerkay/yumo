import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/axios';

interface Slider {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    button_text: string;
    button_link: string;
    image_url: string;
}

export default function HeroSlider() {
    const [sliders, setSliders] = useState<Slider[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/sliders')
            .then(res => setSliders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (sliders.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % sliders.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [sliders.length]);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % sliders.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + sliders.length) % sliders.length);
    };

    if (loading) {
        return <div className="h-[80vh] flex items-center justify-center bg-gray-50">Yükleniyor...</div>;
    }

    if (sliders.length === 0) {
        // Fallback or empty state
        return null;
    }

    return (
        <div className="relative h-[80vh] bg-gray-900 overflow-hidden group">
            {sliders.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'}
                            alt={slide.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center px-4 max-w-4xl mx-auto text-white">
                            {slide.subtitle && (
                                <span className="block text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-4 animate-[fadeInUp_1s_ease-out_0.2s_both]">
                                    {slide.subtitle}
                                </span>
                            )}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-[fadeInUp_1s_ease-out_0.4s_both]">
                                {slide.title}
                            </h1>
                            {slide.description && (
                                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-light animate-[fadeInUp_1s_ease-out_0.6s_both]">
                                    {slide.description}
                                </p>
                            )}
                            {slide.button_text && (
                                slide.button_link?.match(/^https?:\/\//) ? (
                                    <a
                                        href={slide.button_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition transform hover:-translate-y-1 animate-[fadeInUp_1s_ease-out_0.8s_both]"
                                    >
                                        {slide.button_text}
                                    </a>
                                ) : (
                                    <Link
                                        to={slide.button_link || '/urunler'}
                                        className="inline-block bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition transform hover:-translate-y-1 animate-[fadeInUp_1s_ease-out_0.8s_both]"
                                    >
                                        {slide.button_text}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            {sliders.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-2">
                        {sliders.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
