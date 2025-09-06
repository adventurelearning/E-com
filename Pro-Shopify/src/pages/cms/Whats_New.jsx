import { useEffect, useState } from "react";
import Api from "../../Services/Api";

function Whats_New() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Api.get("/whatsnew")
      .then((res) => {
        console.log(res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to load what's new information. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {data.map((content) => (
          <div
            key={content._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
              <p className="mt-2 opacity-90">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="p-6 md:p-8">
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.description }}
              ></div>
            </div>
            
            <div className="bg-gray-100 p-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our what's new information, please contact our support team.
              </p>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Whats_New;