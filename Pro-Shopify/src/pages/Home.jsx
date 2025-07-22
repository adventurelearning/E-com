import React from 'react'
import Banner from '../component/HomePage/Banner'
import Features from '../component/HomePage/Features'
import SubBanner from '../component/HomePage/SubBanner'
import Division from '../component/HomePage/Division'
import ProductsList from '../component/products/ProductsList'
import OfferBanner from '../component/HomePage/OfferBanner'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Banner - takes 2/3 width on large screens */}
          <div className="w-full lg:w-2/3 h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
            <Banner />
          </div>
          
          {/* Sub Banner - takes 1/3 width on large screens */}
          <div className="w-full lg:w-1/3 h-[500px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
            <SubBanner />
          </div>
        </div>
      </section>

      <Division />

      <OfferBanner />
      
      {/* Products Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Featured Products</h2>
        <ProductsList />
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </section>

    </div>
  )
}

export default Home