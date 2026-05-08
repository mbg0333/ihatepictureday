import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Camera, Zap, Image as ImageIcon, Layers, MapPin, Users, Monitor, Printer, Instagram } from "lucide-react";
import Link from "next/link";

const detailedServices = [
  {
    title: "League Picture Day",
    subtitle: "The Foundation",
    description: "Our signature service for youth leagues. Athletes can take as soon as they arrive for their scheduled time—no need to wait on the whole team. Plus, we create perfect dynamic team photos from individual shots, so there's no waiting on everyone to arrive right before the game starts.",
    features: ["On-site professional lighting", "Online proofing", "No paper order forms", "Dynamic team photo"],
    icon: Users,
    image: "/images/hero.png"
  },
  {
    title: "Travel Ball and All\u2011Stars Team Sessions",
    subtitle: "Elite Media",
    description: "Professional media day experience for travel ball and all-star teams. High-end athletic photography with custom graphics that make your roster look like pros.",
    features: ["Per Athlete Price for All Photos", "Custom Graphics", "Multiple Poses", "Team Banner Option w/ Sponsorships"],
    icon: Camera,
    image: "/images/football.png"
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-brand-black flex flex-col">
      <Navbar />
      
      {/* Header */}
      <section className="pt-6 md:pt-10 pb-12 md:pb-20 border-b border-white/5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-brand-red/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <h1 className="text-6xl md:text-9xl font-black italic uppercase mb-8 leading-[0.8] text-stroke">
                Our <br /><span className="text-brand-red">Services</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-xl font-medium leading-relaxed italic">
                We provide end-to-end sports media solutions. From the click of the shutter to the final custom graphic, we handle everything with a premium touch.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 pb-2 relative z-10">
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">Dynamic</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Team Photos</p>
              </div>
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">Fundraising</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Opportunities</p>
              </div>
              
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">100%</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Online Proofing</p>
              </div>
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">ZERO</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Paper Forms</p>
              </div>
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">FAST</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Direct Shipping</p>
              </div>
              <div className="space-y-1 group">
                <p className="text-brand-red font-black text-3xl md:text-5xl italic leading-none group-hover:scale-105 transition-transform origin-left uppercase">HD</p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Custom Graphics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-32">
            {detailedServices.map((service, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-brand-red flex items-center justify-center">
                      <service.icon className="text-white" size={24} />
                    </div>
                    <span className="text-brand-red font-black uppercase tracking-[0.2em] text-sm">
                      {service.subtitle}
                    </span>
                  </div>
                  <h2 
                    className="text-4xl md:text-6xl font-black italic uppercase mb-6 leading-tight"
                    dangerouslySetInnerHTML={{ 
                      __html: service.title.replace('All-Stars', '<span class="whitespace-nowrap">All-Stars</span>') 
                    }}
                  />
                  <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-gray-300">
                        <div className="w-1.5 h-1.5 bg-brand-red" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/booking">
                    <Button variant="outline" size="lg">Inquire About {service.title}</Button>
                  </Link>
                </div>
                <div className="flex-1 w-full aspect-square relative overflow-hidden bg-zinc-900 border border-white/5 group">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="object-cover w-full h-full opacity-60 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}
