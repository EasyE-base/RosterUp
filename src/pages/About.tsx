import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function About() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-white font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 px-6 md:px-8 lg:px-12 overflow-hidden bg-[rgb(251,251,253)]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <span className="inline-block text-sm font-bold uppercase tracking-wider text-[rgb(0,113,227)]">
                            Our Story
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-semibold text-[rgb(29,29,31)] mb-8 leading-tight tracking-tight"
                    >
                        Built by Parents. <br />
                        Built for the Game.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-[rgb(86,88,105)] max-w-2xl mx-auto leading-relaxed"
                    >
                        We built RosterUp because we lived through the chaos and knew there had to be something better.
                    </motion.p>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-20 px-6 md:px-8 lg:px-12 bg-white">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="prose prose-lg prose-slate mx-auto"
                    >
                        <p className="text-xl leading-relaxed text-[rgb(29,29,31)] font-medium mb-8">
                            Travel sports are incredible—but they can also be overwhelming. As parents, we live it every weekend.
                        </p>
                        <p className="text-lg text-[rgb(86,88,105)] leading-relaxed mb-6">
                            Early-morning tournaments. Last-minute schedule changes. Messages coming from five different apps. Coaches juggling rosters. Players searching for opportunities. Trainers trying to grow their business. Organizations running everything behind the scenes with almost no support.
                        </p>
                        <p className="text-lg text-[rgb(86,88,105)] leading-relaxed">
                            We’re not a big corporation trying to reinvent sports from the outside. We’re parents and coaches who saw the problems firsthand—lost messages, missed tryouts, confusing tournament info, roster mistakes, and endless spreadsheets. And instead of accepting it, we decided to build the platform we always wished existed.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-6 md:px-8 lg:px-12 bg-[rgb(29,29,31)] text-white text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-8">
                        Our Mission
                    </h2>
                    <p className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                        Make travel sports seamless.
                    </p>
                    <p className="mt-8 text-xl text-white/80 max-w-2xl mx-auto">
                        We believe youth sports should be exciting, inspiring, and organized—not stressful.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 md:px-8 lg:px-12 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(29,29,31)] mb-4">
                            Everything in one place
                        </h2>
                        <p className="text-lg text-[rgb(86,88,105)]">
                            RosterUp is a modern sports platform designed to make life easier for everyone.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {[
                            "Smarter team management",
                            "Clear scheduling and communication",
                            "A real marketplace for players, organizations, and trainers",
                            "Beautiful profiles that help athletes get discovered",
                            "Tools that keep parents informed and players supported"
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start gap-4"
                            >
                                <div className="mt-1 p-1 rounded-full bg-blue-50">
                                    <CheckCircle2 className="w-5 h-5 text-[rgb(0,113,227)]" />
                                </div>
                                <span className="text-lg text-[rgb(29,29,31)] font-medium">
                                    {feature}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Closing Section */}
            <section className="py-24 px-6 md:px-8 lg:px-12 bg-[rgb(251,251,253)] border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-xl md:text-2xl text-[rgb(86,88,105)] leading-relaxed mb-10">
                            RosterUp is built with care, built with experience, and built with the belief that youth sports deserve a better future. Whether you’re a family navigating travel ball for the first time, a coach managing multiple teams, or a trainer working to grow your impact—we’re here to help make sports easier, more connected, and more fun.
                        </p>
                        <h3 className="text-3xl md:text-4xl font-bold text-[rgb(29,29,31)]">
                            This is sports management, finally done right. <br />
                            <span className="text-[rgb(0,113,227)]">This is RosterUp.</span>
                        </h3>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
