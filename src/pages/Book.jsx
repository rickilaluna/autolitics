import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Clock, ShieldCheck, Globe, Calendar, ChevronLeft, Check } from 'lucide-react';
import ReactSlider from 'react-slider';

export default function Book() {
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Comprehensive Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        timeline: '',
        considering: '',
        budget: [20, 80],
        vehicleTypes: [],
        powertrains: [],
        size: '',
        helpText: '',
        availability: {} // format: { 'Monday': ['Morning (9-12)'], ... }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.fade-up',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // State updaters
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleArrayItem = (key, item) => {
        setFormData(prev => {
            const arr = prev[key];
            if (arr.includes(item)) {
                return { ...prev, [key]: arr.filter(i => i !== item) };
            } else {
                return { ...prev, [key]: [...arr, item] };
            }
        });
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const newAvailability = { ...prev.availability };
            if (newAvailability[day]) {
                delete newAvailability[day];
            } else {
                newAvailability[day] = []; // Initialize empty array for times
            }
            return { ...prev, availability: newAvailability };
        });
    };

    const handleTimeToggle = (day, time) => {
        setFormData(prev => {
            const dayTimes = prev.availability[day] || [];
            const newTimes = dayTimes.includes(time)
                ? dayTimes.filter(t => t !== time)
                : [...dayTimes, time];

            return {
                ...prev,
                availability: {
                    ...prev.availability,
                    [day]: newTimes
                }
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Form Submission Strategy:
        // We use Web3Forms (or Formspree) because it requires zero backend for static sites.
        // You just need to create an account, grab your access key, and place it below.

        const payload = {
            access_key: "82e1f5db-b496-4389-84d5-d8d5f8aa8720", // <-- Place your key here!
            subject: `New Intro Call Request from ${formData.name}`,
            ...formData,
            budget: `$${formData.budget[0]}k - $${formData.budget[1]}k`,
            availability: JSON.stringify(formData.availability, null, 2)
        };

        try {

            // Uncomment this block when you add your access key: //
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();


            // Simulating a successful submission for now
            await new Promise(resolve => setTimeout(resolve, 1500));
            navigate('/scheduled'); // Redirect to new scheduled page

        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['Morning (9–12)', 'Afternoon (12–3)', 'Evening (3–6)'];

    return (
        <div ref={containerRef} className="bg-background min-h-screen text-text font-sans relative flex flex-col items-center py-12 px-6">

            {/* Back Button */}
            <div className="w-full max-w-3xl mb-8 fade-up">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-text/60 hover:text-primary transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Home
                </Link>
            </div>

            {/* Header */}
            <div className="text-center max-w-2xl mb-12 fade-up">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                    Book Your Free Intro Call
                </h1>
                <p className="text-lg text-text/70 mb-8">
                    A focused 20-minute conversation to understand your needs and see if the advisory is a fit.
                </p>

                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-text/80">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Clock className="w-4 h-4 text-accent" />
                        20 minutes
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        No obligation
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Globe className="w-4 h-4 text-accent" />
                        Independent guidance
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-text/5 fade-up">
                <form onSubmit={handleSubmit} className="space-y-10 flex flex-col">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-primary">Name</label>
                            <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Your name" className="w-full bg-background border border-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-primary">Email</label>
                            <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@email.com" className="w-full bg-background border border-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-primary">Timeline</label>
                        <select required name="timeline" value={formData.timeline} onChange={handleChange} className="w-full bg-background border border-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors appearance-none">
                            <option value="">Select your timeline</option>
                            <option value="ASAP">ASAP</option>
                            <option value="1-3 months">Within 1-3 months</option>
                            <option value="3-6 months">Within 3-6 months</option>
                            <option value="Researching">Just researching</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-primary">
                            Are you considering? <span className="text-text/40 font-normal">(optional)</span>
                        </label>
                        <div className="flex gap-6">
                            {['New', 'Used', 'Not sure'].map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${formData.considering === opt ? 'border-accent bg-accent' : 'border-text/20 group-hover:border-accent/50'}`}>
                                        {formData.considering === opt && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <input type="radio" name="considering" value={opt} checked={formData.considering === opt} onChange={handleChange} className="hidden" />
                                    <span className="text-sm font-medium">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="block text-sm font-bold text-primary">
                                Budget range <span className="text-text/40 font-normal">(optional)</span>
                            </label>
                            <span className="text-sm font-mono font-medium text-accent">
                                ${formData.budget[0]},000 – ${formData.budget[1]},000
                            </span>
                        </div>
                        <div className="px-2 pt-2">
                            <ReactSlider
                                className="w-full h-1.5 bg-text/5 rounded-full"
                                thumbClassName="w-5 h-5 bg-white border-2 border-accent rounded-full cursor-grab outline-none -mt-[7px] shadow-sm flex items-center justify-center focus:ring-4 focus:ring-accent/20 transition-shadow"
                                trackClassName="h-1.5 bg-accent rounded-full"
                                min={10}
                                max={150}
                                step={5}
                                value={formData.budget}
                                onChange={(val) => setFormData(prev => ({ ...prev, budget: val }))}
                                pearling
                                minDistance={10}
                                renderTrack={(props, state) => <div {...props} className={`h-1.5 rounded-full ${state.index === 1 ? 'bg-accent' : 'bg-text/5'}`} />}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-primary">
                            Vehicle type <span className="text-text/40 font-normal">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Coupe', 'Sedan', 'Wagon', 'Crossover', 'SUV', 'Van', 'Truck'].map(type => {
                                const isSelected = formData.vehicleTypes.includes(type);
                                return (
                                    <button
                                        type="button"
                                        onClick={() => toggleArrayItem('vehicleTypes', type)}
                                        key={type}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${isSelected ? 'bg-primary text-white border-transparent' : 'border border-text/10 bg-background hover:border-accent/40 text-text/80'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-primary">
                            Powertrain <span className="text-text/40 font-normal">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Gas', 'Hybrid', 'PHEV', 'EV'].map(type => {
                                const isSelected = formData.powertrains.includes(type);
                                return (
                                    <button
                                        type="button"
                                        onClick={() => toggleArrayItem('powertrains', type)}
                                        key={type}
                                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${isSelected ? 'bg-primary text-white border-transparent' : 'border border-text/10 bg-background hover:border-accent/40 text-text/80'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-primary">
                            Size <span className="text-text/40 font-normal">(optional)</span>
                        </label>
                        <select name="size" value={formData.size} onChange={handleChange} className="w-full bg-background border border-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors appearance-none">
                            <option value="">Select size</option>
                            <option value="Compact">Compact</option>
                            <option value="Mid-size">Mid-size</option>
                            <option value="Full-size">Full-size</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-primary">What would you most like help with?</label>
                        <textarea name="helpText" value={formData.helpText} onChange={handleChange} placeholder="e.g., Narrowing down options, negotiating, understanding total cost..." className="w-full bg-background border border-text/10 rounded-xl px-4 py-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"></textarea>
                    </div>

                    <hr className="border-text/5 my-4" />

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-primary mb-2">Select Your Availability</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-text/60">
                                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                                <span>Choose the days and time blocks that work for you.</span>
                            </div>
                        </div>

                        {/* Days Selection */}
                        <div className="flex flex-wrap gap-3">
                            {days.map(day => {
                                const isSelected = !!formData.availability[day];
                                return (
                                    <button
                                        type="button"
                                        onClick={() => handleDayToggle(day)}
                                        key={day}
                                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-sm ${isSelected ? 'bg-accent text-primary border-transparent' : 'border border-text/10 bg-white hover:border-accent/40 text-text/80'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Progressive Timeslot Display */}
                        {Object.keys(formData.availability).length > 0 && (
                            <div className="flex flex-col gap-4 mt-6">
                                {days.filter(d => formData.availability[d]).map(day => (
                                    <div key={day} className="p-5 rounded-2xl border border-text/10 bg-background/50 animate-[fadeIn_0.3s_ease-out]">
                                        <h4 className="font-bold text-primary text-sm mb-4">{day}</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {timeSlots.map(time => {
                                                const isSelected = formData.availability[day].includes(time);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={time}
                                                        onClick={() => handleTimeToggle(day, time)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${isSelected
                                                            ? 'bg-accent/10 border-accent/40 text-primary'
                                                            : 'bg-white border-text/10 text-text/60 hover:border-text/20 hover:text-text'
                                                            }`}
                                                    >
                                                        {isSelected ? <Check className="w-3.5 h-3.5 text-accent" /> : <Clock className="w-3.5 h-3.5" />}
                                                        {time}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center gap-6 border-t border-text/5 mt-4">
                        <button disabled={isSubmitting} type="submit" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-[1.03] shadow-[0_4px_14px_rgba(13,13,18,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                        </button>
                        <Link to="/" className="text-sm font-medium text-text/50 hover:text-primary transition-colors">
                            Maybe later
                        </Link>
                    </div>
                </form>
            </div>

            <p className="mt-12 text-center text-sm italic text-text/50 max-w-sm fade-up">
                I work with a limited number of clients each month to ensure focused support.
            </p>

        </div>
    );
}
