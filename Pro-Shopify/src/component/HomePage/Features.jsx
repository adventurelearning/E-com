import React from 'react'

const Features = () => {
  const features = [
    {
      title: "Curb-side pickup",
      description: "Convenient pickup at your local store",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      )
    },
    {
      title: "Free shipping",
      description: "On orders over $50",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      )
    },
    {
      title: "Low prices guaranteed",
      description: "Best deals for our customers",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )
    },
    {
      title: "Available to you 24/7",
      description: "Shop whenever you want",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Why Choose Us
          </h2>
          <p className="mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-600 mx-auto">
            We provide the best services to make your shopping experience better
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="pt-4 sm:pt-6">
              <div className="flow-root bg-white rounded-lg px-4 sm:px-6 pb-6 sm:pb-8 h-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-2">
                <div className="-mt-6">
                  <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 sm:h-8 sm:w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="mt-4 sm:mt-6 text-sm sm:text-lg font-medium text-gray-900 tracking-tight text-center">
                    {feature.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-base text-gray-500 text-center">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  )
}

export default Features