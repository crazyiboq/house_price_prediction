
import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    Bedrooms: "",
    Bathrooms: "",
    Sqm: "",
    City: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setPrediction(null);

    const houseData = {
      Bedrooms: Number(formData.Bedrooms),
      Bathrooms: Number(formData.Bathrooms),
      Sqm: Number(formData.Sqm),
      City: formData.City.trim(),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(houseData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Prediction failed");
      }

      setPrediction(result.predicted_price);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h2>Estate<span>IQ.</span></h2>
        <p>AI PROPERTY ESTIMATOR</p>
      </nav>

      <main className="container">
        <section className="hero">
          <span>REAL ESTATE · MACHINE LEARNING</span>
          <h1>Discover your property's value.</h1>
          <p>
            Enter your property information and let our
            machine learning model estimate its price.
          </p>
        </section>

        <section className="content">
          <form className="form-card" onSubmit={handleSubmit}>
            <h2>Property details</h2>
            <p className="subtitle">
              Provide your property's characteristics.
            </p>

            <div className="form-grid">
              <div className="field">
                <label>Bedrooms</label>
                <input
                  type="number"
                  name="Bedrooms"
                  min="1"
                  required
                  value={formData.Bedrooms}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                />
              </div>

              <div className="field">
                <label>Bathrooms</label>
                <input
                  type="number"
                  name="Bathrooms"
                  min="1"
                  step="any"
                  required
                  value={formData.Bathrooms}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
              </div>

              <div className="field">
                <label>Area (m²)</label>
                <input
                  type="number"
                  name="Sqm"
                  min="1"
                  step="any"
                  required
                  value={formData.Sqm}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                />
              </div>

              <div className="field">
                <label>City</label>
                <input
                  type="text"
                  name="City"
                  required
                  value={formData.City}
                  onChange={handleChange}
                  placeholder="e.g. Baku"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Calculating..." : "Estimate property price →"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>

          <section className="result-card">
            <h2>Prediction result</h2>

            <span>ESTIMATED PROPERTY VALUE</span>

            <h1>
              {prediction !== null
                ? `${prediction.toLocaleString("en-US")} AZN`
                : "—"}
            </h1>

            <p>
              {prediction !== null
                ? "Your property estimate is ready."
                : "Your estimated price will appear here."}
            </p>

            <div className="result-footer">
              Powered by FastAPI and Scikit-learn
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
