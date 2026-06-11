import Hero from '../components/Hero';
import MoodForm from '../components/MoodForm';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Hero />

      <MoodForm />

      <About />

      <Testimonials />

      <Footer />
    </>
  );
}

export default Home;