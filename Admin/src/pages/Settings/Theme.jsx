import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../Services/Api";

const ThemePage = () => {
  const [themeData, setThemeData] = useState({
    primary: "#3b82f6",
    secondary: "#6b7280",
    accent: "#f59e0b",
    darkMode: false,
  });
  const [themeId, setThemeId] = useState(null);
  const navigate = useNavigate();

  // Fetch latest theme
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await Api.get("/theme");
        if (data && Object.keys(data).length > 0) {
          setThemeData(data);
          setThemeId(data._id);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };
    fetchTheme();
  }, []);

  const handleColorChange = (field, value) => {
    setThemeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      let response;
      if (themeId) {
        response = await Api.put(`/theme/${themeId}`, themeData);
      } else {
        response = await Api.post("/theme", themeData);
      }

      if (response.status === 200) {
        alert(response.data.message);
        setThemeId(response.data.theme._id);
        navigate("/settings");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Error saving theme. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Theme Customization
        </h1>

        {/* Color Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Color Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {["primary", "secondary", "accent"].map((colorType) => (
              <div key={colorType}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {colorType.charAt(0).toUpperCase() + colorType.slice(1)} Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={themeData[colorType]}
                    onChange={(e) => handleColorChange(colorType, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <span className="ml-3 text-gray-600">
                    {themeData[colorType]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="darkMode"
              checked={themeData.darkMode}
              onChange={(e) => handleColorChange("darkMode", e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="darkMode"
              className="ml-2 block text-sm text-gray-900"
            >
              Enable Dark Mode
            </label>
          </div>

          {/* Save / Cancel */}
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              {themeId ? "Update Theme" : "Save Theme"}
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Theme Preview
          </h3>
          <div
            className="p-4 border rounded-lg"
            style={{
              backgroundColor: themeData.darkMode ? "#1f2937" : "#f9fafb",
            }}
          >
            <div className="flex space-x-4 mb-4">
              <button
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: themeData.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: themeData.secondary }}
              >
                Secondary Button
              </button>
            </div>
            <div
              className="p-4 rounded-md mb-4"
              style={{
                backgroundColor: themeData.accent,
                color: "white",
              }}
            >
              Accent Background
            </div>
            <p className={themeData.darkMode ? "text-white" : "text-gray-800"}>
              This is how your theme will look with the selected colors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePage;
