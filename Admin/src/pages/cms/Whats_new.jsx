import React, { useState, useEffect } from 'react';
import Editor from '../../components/Editor';
import Api from '../../Services/Api';

const Whats_new = () => {
  const [title, setTitle] = useState('');
  const [des, setDes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [policyId, setPolicyId] = useState(null); // store existing policy ID

  // Fetch existing policy on mount
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await Api.get('/whatsnew');
        if (response.data) {
          setTitle(response.data.title || '');
          setDes(response.data.description || '');
          setPolicyId(response.data._id || null); // assuming MongoDB-like ID
        }
      } catch (error) {
        console.error('Error fetching return policy:', error);
      }
    };

    fetchPolicy();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!title.trim() || !des.trim()) {
      alert('Please fill in both Title and Description');
      return;
    }

    setLoading(true);

    try {
      if (policyId) {
        // Update existing policy
        await Api.put(`/whatsnew/${policyId}`, {
          title,
          description: des,
        });
      } else {
        // Create new policy
        const res = await Api.post('/whatsnew', {
          title,
          description: des,
        });
        setPolicyId(res.data._id); // store new ID
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error saving whats new:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchPolicy = async () => {
    try {
      const response = await Api.get('/whatsnew');
      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      if (data) {
        setTitle(data.title || '');
        setDes(data.description || '');
        setPolicyId(data._id || null);
      }
    } catch (error) {
      console.error('Error fetching whats new:', error);
    }
  };

  fetchPolicy();
}, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">What's New</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter return policy title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <Editor value={des} onChange={setDes} height={300} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : policyId ? 'Update' : 'Submit'}
          </button>

          {success && (
            <p className="text-green-600 text-sm">
              What's New {policyId ? 'updated' : 'saved'} successfully!
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Whats_new;
