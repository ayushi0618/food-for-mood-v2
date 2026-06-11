import { useEffect, useState } from 'react';

import Hero from '../components/Hero';
import MoodForm from '../components/MoodForm';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

import foodImages from '../data/foodImages';

function Home() {

  const [recent, setRecent] = useState([]);

  useEffect(() => {

    fetch('http://localhost:5000/api/recent')

      .then((res) => res.json())

      .then((data) => {
        setRecent(data);
      })

      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    <>

      <Hero />

      <MoodForm />

      <About />

      <Testimonials />

      <section className="recent-section">

        <h2>
          Recent Recommendations
        </h2>

        <div className="recent-grid">

          {recent.map((item) => (

            <div
              key={item._id}
              className="recent-card"
            >

              <img
                src={
                  foodImages[item.food] ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
                }
                alt={item.food}
                className="recent-image"
              />

              <h3>
                {item.food}
              </h3>

              <p>
                ₹{item.price}
              </p>

            </div>

          ))}

        </div>

      </section>

      <Footer />

    </>
  );
}

export default Home;