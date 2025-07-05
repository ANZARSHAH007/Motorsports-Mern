"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function CarOwnerPage() {
  const [activeTab, setActiveTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [events, setEvents] = useState([]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [currentCar, setCurrentCar] = useState(null);
  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    mods: "",
    performanceStats: "",
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCar, setSelectedCar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (err) {
      console.error("Error parsing user data:", err);
      return null;
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/events/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error fetching events");
      }

      setEvents(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch events error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/cars/my-cars/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error fetching cars");
      }

      setCars(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch cars error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove fetchRegistrations function - not needed since data is in events

  // Check if user is car owner and fetch data
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "carOwner") {
      window.location.href = "/login";
      return;
    }

    fetchEvents();
    fetchCars();
    // Remove fetchRegistrations() call
  }, []);

  // Event handlers
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    Cookies.remove("token");
    window.location.href = "/login";
  };

  const openCarModal = (car = null) => {
    const user = getCurrentUser();
    if (!user) return;

    if (car) {
      setCurrentCar(car);
      setCarForm({
        brand: car.brand || "",
        model: car.model || "",
        year: car.year || "",
        color: car.color || "",
        mods: Array.isArray(car.mods) ? car.mods.join(", ") : car.mods || "",
        performanceStats:
          typeof car.performanceStats === "object"
            ? JSON.stringify(car.performanceStats)
            : car.performanceStats || "",
      });
    } else {
      setCurrentCar(null);
      setCarForm({
        brand: "",
        model: "",
        year: "",
        color: "",
        mods: "",
        performanceStats: "",
      });
    }
    setShowCarModal(true);
  };

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setSelectedCar(cars.length > 0 ? cars[0]._id : "");
    setShowRegisterModal(true);
  };

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setCarForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = getCurrentUser();
    if (!user) return;

    const url = currentCar
      ? `http://localhost:5000/api/cars/update-car/${currentCar._id}`
      : `http://localhost:5000/api/cars/add-car`;

    const method = currentCar ? "PUT" : "POST";

    // Parse mods and performance stats
    const modsArray = carForm.mods
      ? carForm.mods
          .split(",")
          .map((mod) => mod.trim())
          .filter((mod) => mod)
      : [];

    let performanceStatsObj = {};
    if (carForm.performanceStats) {
      try {
        performanceStatsObj = JSON.parse(carForm.performanceStats);
      } catch {
        // If not valid JSON, treat as string
        performanceStatsObj = { notes: carForm.performanceStats };
      }
    }

    const body = {
      brand: carForm.brand,
      model: carForm.model,
      year: carForm.year,
      color: carForm.color,
      mods: modsArray,
      performanceStats: performanceStatsObj,
      owner: user.name,
      ownerId: user._id,
    };

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Car submission failed");
      }

      await fetchCars();
      setShowCarModal(false);
      setCarForm({
        brand: "",
        model: "",
        year: "",
        color: "",
        mods: "",
        performanceStats: "",
      });
    } catch (err) {
      setError(err.message);
      console.error("Car form error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCar || !selectedEvent) {
      setError("Please select a car and event");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      setError("User not found. Please log in again.");
      return;
    }

    // Check if car is already registered in the event's carsRegistered array
    const alreadyRegistered =
      selectedEvent.carsRegistered &&
      selectedEvent.carsRegistered.some((carObj) => {
        const registeredCarId =
          typeof carObj === "object" ? carObj._id : carObj;
        return registeredCarId === selectedCar;
      });

    if (alreadyRegistered) {
      setError("This car is already registered for this event");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/events/register-car/${selectedEvent._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            carId: selectedCar,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Refresh events to get updated data
      await fetchEvents();
      setShowRegisterModal(false);
      setSelectedCar("");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id) => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/cars/delete-car/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      await fetchCars();
      // Refresh events to ensure any registrations are updated
      await fetchEvents();
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a car is registered for an event
  const isCarRegistered = (eventId, carId) => {
    const event = events.find((e) => e._id === eventId);
    if (!event || !event.carsRegistered) return false;

    return event.carsRegistered.some((carObj) => {
      const registeredCarId = typeof carObj === "object" ? carObj._id : carObj;
      return registeredCarId === carId;
    });
  };

  const getCarById = (carId) => {
    return cars.find((car) => car._id === carId);
  };

  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Car Owner Dashboard
            </h1>
            {user && (
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            Loading...
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("cars")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "cars"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Cars
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "events"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Events
            </button>
          </nav>
        </div>

        {/* Cars Tab Content */}
        {activeTab === "cars" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Cars</h2>
              <button
                onClick={() => openCarModal()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
                disabled={loading}
              >
                Add Car
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mods
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cars.map((car) => (
                      <tr key={car._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {car.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {car.model}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(car.mods)
                            ? car.mods.join(", ")
                            : car.mods || "None"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {car.performanceStats &&
                          typeof car.performanceStats === "object"
                            ? Object.values(car.performanceStats).join(", ")
                            : car.performanceStats || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openCarModal(car)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cars.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No cars found. Add your first car!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Available Events
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.name}
                    </h3>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {event.location}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {event.date}
                      </p>
                      <p>
                        <span className="font-medium">Ticket Price:</span> $
                        {event.ticketPrice}
                      </p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Your Registered Cars:
                      </h4>
                      <ul className="text-sm text-gray-600 mb-4">
                        {event.carsRegistered &&
                        event.carsRegistered.length > 0 ? (
                          event.carsRegistered
                            .filter((carObj) => {
                              // Handle both cases: if carsRegistered contains objects with _id or just strings
                              const carId =
                                typeof carObj === "object"
                                  ? carObj._id
                                  : carObj;
                              const car = getCarById(carId);
                              return car && car.ownerId === user._id;
                            })
                            .map((carObj) => {
                              const carId =
                                typeof carObj === "object"
                                  ? carObj._id
                                  : carObj;
                              const car = getCarById(carId);
                              if (!car) return null;
                              return (
                                <li
                                  key={carId}
                                  className="flex justify-between items-center mb-1"
                                >
                                  <span>
                                    {car.brand} {car.model}{" "}
                                    {car.year && `(${car.year})`}
                                  </span>
                                </li>
                              );
                            })
                            .filter(Boolean)
                        ) : (
                          <li className="text-gray-500 italic">
                            No cars registered
                          </li>
                        )}
                      </ul>
                    </div>

                    <button
                      onClick={() => openRegisterModal(event)}
                      className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium disabled:bg-gray-400"
                      disabled={cars.length === 0 || loading}
                    >
                      Register Car
                    </button>
                    {cars.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Add a car first to register
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No events available at the moment.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Car Modal */}
      {showCarModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentCar ? "Edit Car" : "Add New Car"}
              </h3>
            </div>

            <form onSubmit={handleCarSubmit}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="brand"
                  >
                    Brand *
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={carForm.brand}
                    onChange={handleCarChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="model"
                  >
                    Model *
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={carForm.model}
                    onChange={handleCarChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="mods"
                  >
                    Modifications (comma-separated)
                  </label>
                  <textarea
                    id="mods"
                    name="mods"
                    value={carForm.mods}
                    onChange={handleCarChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="e.g., Cold air intake, Exhaust system, Turbo"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="performanceStats"
                  >
                    Performance Stats (JSON format or notes)
                  </label>
                  <textarea
                    id="performanceStats"
                    name="performanceStats"
                    value={carForm.performanceStats}
                    onChange={handleCarChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder='{"horsepower": 300, "torque": 350} or just notes'
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium mr-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? "Saving..." : currentCar ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Car Modal */}
      {showRegisterModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Register Car for {selectedEvent.name}
              </h3>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="carId"
                  >
                    Select Car
                  </label>
                  <select
                    id="carId"
                    name="carId"
                    value={selectedCar}
                    onChange={(e) => setSelectedCar(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a car</option>
                    {cars.map((car) => (
                      <option
                        key={car._id}
                        value={car._id}
                        disabled={isCarRegistered(selectedEvent._id, car._id)}
                      >
                        {car.brand} {car.model} {car.year && `(${car.year})`}{" "}
                        {isCarRegistered(selectedEvent._id, car._id)
                          ? "- Already Registered"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <h4 className="block text-gray-700 text-sm font-bold mb-2">
                    Event Details
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Location:</span>{" "}
                      {selectedEvent.location}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {selectedEvent.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Ticket Price:</span> $
                      {selectedEvent.ticketPrice}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium mr-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
