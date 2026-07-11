import CtaBand from "./CtaBand";
import FaqSection from "./FaqSection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import MarketingShell from "./MarketingShell";
import PricingSection from "./PricingSection";

const LandingPage = () => {
  return (
    <MarketingShell>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaBand />
    </MarketingShell>
  );
};

export default LandingPage;
