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
      <section className="w-[full] px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:h-[500px]">
          {/* Main Banner - 2/3 width on large screens */}
          <div className="w-full lg:w-3/4 h-[200px] sm:h-[350px] md:h-[400px] lg:h-full">
            <Banner />
          </div>

          {/* Sub Banner - 1/3 width on large screens */}
          <div className="w-[full] lg:w-1/4 h-[150px] sm:h-[180px] md:h-[200px] lg:h-full">
            <SubBanner />
          </div>
        </div>
      </section>
  <section className="w-full mx-auto  sm:px-6 lg:px-4 ">
      <Division />
    </section>
      <OfferBanner />
      
      {/* Products Section */}
      <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        <ProductsList />
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-12">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </section>

    </div>
  )
}

export default Home