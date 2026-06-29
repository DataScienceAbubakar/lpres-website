import Hero from '../components/sections/Hero';
import StatsTicker from '../components/sections/StatsTicker';
import QuickLinks from '../components/sections/QuickLinks';
import ProjectOverview from '../components/sections/ProjectOverview';
import CoordinatorMessage from '../components/sections/CoordinatorMessage';
import ProgrammeImpact from '../components/sections/ProgrammeImpact';
import CoreValues from '../components/sections/CoreValues';
import ProjectComponents from '../components/sections/ProjectComponents';
import ValueChains from '../components/sections/ValueChains';
import OnTheGround from '../components/sections/OnTheGround';
import Partners from '../components/sections/Partners';
import GDSSPreview from '../components/sections/GDSSPreview';
import Publications from '../components/sections/Publications';
import NewsSection from '../components/sections/NewsSection';
import Contact from '../components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsTicker />
      <QuickLinks />
      <CoordinatorMessage />
      <ProgrammeImpact />
      <ProjectComponents />
      <ValueChains />
      <ProjectOverview />
      <CoreValues />
      <OnTheGround />
      <Partners />
      <GDSSPreview />
      <Publications />
      <NewsSection />
      <Contact />
    </>
  );
}
