import { StartupForm } from "@/components/startup-form";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 pb-2">
          Unlock Your Custom <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Startup Idea in 5 Minutes
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          AI analyzes your <strong>MBTI</strong>, <strong>Location</strong>, and <strong>Budget</strong> to generate a personalized business plan, roadmap, and affiliate tool recommendations.
        </p>
      </section>

      {/* Input Form Section */}
      <section id="generate" className="w-full max-w-4xl mx-auto">
        <StartupForm />
      </section>
    </div>
  );
}
