import { motion } from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Video,
  Shield,
  Zap,
  Layout,
  Smartphone
} from 'lucide-react';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-300">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-bold text-black mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h4>
      <p className="text-slate-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

interface SectionProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: FeatureItemProps[];
  align?: 'left' | 'right';
  buttonText: string;
}

const EditorialSection = ({ title, subtitle, description, image, features, align = 'left', buttonText }: SectionProps) => {
  return (
    <div className="mb-32 last:mb-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}
      >
        {/* Hero Image Card */}
        <div className={`lg:col-span-7 ${align === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl aspect-[4/3] lg:aspect-[16/10]">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700 z-10" />
            <motion.img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />

            {/* Overlay Content */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-white uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                {subtitle}
              </span>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                {title}
              </h3>
              <button className="flex items-center gap-2 text-white font-semibold group/btn hover:gap-4 transition-all duration-300">
                {buttonText} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className={`lg:col-span-5 ${align === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="space-y-8 px-4 lg:px-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                The Competitive Edge
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, idx) => (
                <FeatureItem key={idx} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function BentoFeatureGrid() {
  return (
    <section className="relative py-32 px-6 md:px-8 lg:px-12 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-32 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-black mb-8 tracking-tighter uppercase">
            Elevate Your Game
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
            The complete ecosystem for modern sports. Whether you lead, play, or train—we build the tools that power champions.
          </p>
        </div>

        {/* Organizations Section */}
        <EditorialSection
          subtitle="For Organizations"
          title="COMMAND THE FIELD"
          description="Stop managing spreadsheets and start managing talent. Our all-in-one dashboard gives you professional-grade tools to run leagues, tournaments, and clubs with military precision."
          image="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2929&auto=format&fit=crop"
          buttonText="Explore Organization Tools"
          features={[
            {
              icon: <Layout className="w-5 h-5" />,
              title: "Mission Control",
              description: "One dashboard for rosters, finances, and scheduling."
            },
            {
              icon: <Trophy className="w-5 h-5" />,
              title: "Tournament Engine",
              description: "Automated brackets and live scoring that keeps fans engaged."
            },
            {
              icon: <Target className="w-5 h-5" />,
              title: "Smart Recruiting",
              description: "Find the missing piece for your roster with AI matching."
            }
          ]}
        />

        {/* Players Section */}
        <EditorialSection
          subtitle="For Athletes"
          title="BE SEEN. GET SIGNED."
          description="Your talent deserves a platform. Build a verified athlete profile, showcase your highlights, and connect directly with the teams and scouts looking for players like you."
          image="https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=2940&auto=format&fit=crop"
          align="right"
          buttonText="Build Your Profile"
          features={[
            {
              icon: <Shield className="w-5 h-5" />,
              title: "Verified Profile",
              description: "Your digital athletic resume with verified stats and video."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Direct Opportunities",
              description: "Apply to tryouts and open roster spots with one click."
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "Network",
              description: "Connect with coaches and teams in your area."
            }
          ]}
        />

        {/* Trainers Section */}
        <EditorialSection
          subtitle="For Trainers"
          title="BUILD YOUR EMPIRE"
          description="Turn your expertise into a thriving business. We handle the booking, payments, and client management so you can focus on what you do best: developing athletes."
          image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2940&auto=format&fit=crop"
          buttonText="Start Training"
          features={[
            {
              icon: <Smartphone className="w-5 h-5" />,
              title: "Business in a Box",
              description: "Automated booking and payments directly on your phone."
            },
            {
              icon: <Video className="w-5 h-5" />,
              title: "Video Analysis",
              description: "Provide professional feedback with breakdown tools."
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: "Client Progress",
              description: "Track development and prove your value with data."
            }
          ]}
        />
      </div>
    </section>
  );
}
