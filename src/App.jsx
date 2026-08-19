import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Booking from './components/Booking'
import About from './components/About'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  // Lifted so clicking "Book This Package" in Services can pre-select the
  // service in the Booking wizard below it.
  const [selectedService, setSelectedService] = useState(null)

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Services onSelectService={setSelectedService} />
      <Booking selectedService={selectedService} />
      <About />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
