import Hero from '../components/sections/Hero';
import Statistics from '../components/sections/Statistics';
import About from '../components/sections/About';
import Mission from '../components/sections/Mission';
import Programs from '../components/sections/Programs';
import Team from '../components/sections/Team';
import NewsSection from '../components/sections/NewsSection';
import Contact from '../components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <Statistics />
      <About />
      <Mission />
      <Programs />
      <Team />
      <NewsSection />
      <Contact />
    </>
  );
}
