import React, { useState } from 'react';
import axios from 'axios';
import Api from '../Services/Api';

const Logo = () => {
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !altText.trim()) {
      return setMessage('Please select an image and enter alt text.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);
    formData.append('context', `alt=${altText}`);

    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
      const response = await axios.post(cloudinaryUrl, formData);

      const backend=await Api.post('/logo', { imageUrl: response.data.secure_url, altText });
      setMessage('Logo uploaded successfully!');
      console.log('Cloudinary Upload Response:', response.data);

      setFile(null);
      setAltText('');
    } catch (err) {
      setMessage('Upload to Cloudinary failed.');
      console.error('Error uploading:', err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Upload Logo</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 block w-full text-sm text-gray-700"
        />
        <input
          type="text"
          placeholder="Enter alt text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="mb-4 w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  );
};

export default Logo;
