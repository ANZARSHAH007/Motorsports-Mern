import { useState, useEffect } from "react";

import Cookies from "js-cookie";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    id: "",
    name: "",
    location: "",
    date: "",
    ticketPrice: "",
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userForm, setUserForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch events:", data);
        throw new Error(data.message || "Error fetching events");
      }

      // Do something with the data (e.g., set state)
      console.log("Events:", data);
      setEvents(data);
    } catch (err) {
      console.log("Fetch events error:", err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch users:", data);
        throw new Error(data.message || "Error fetching users");
      }

      // Do something with the data (e.g., set state)
      console.log("Users:", data);
      setUsers(data.users);
    } catch (err) {
      console.log("Fetch users error:", err.message);
    }
  };

  const fetchCars = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/cars/all-cars", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to fetch cars:", data);
      throw new Error(data.message || "Error fetching cars");
    }
    setCars(data);
  } catch (err) {
    console.log("Fetch cars error:", err.message);
  }
};

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
    }

    fetchEvents();
    fetchUsers();
    fetchCars();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

const openEventModal = (event = null) => {
  if (event) {
    // Format date as YYYY-MM-DD
    const formattedDate = new Date(event.date).toISOString().split("T")[0];

    setCurrentEvent(event);
    setEventForm({
      id: event._id,
      name: event.name,
      location: event.location,
      date: formattedDate, // ✅ fixed format
      ticketPrice: event.ticketPrice,
    });
  } else {
    setCurrentEvent(null);
    setEventForm({
      id: Date.now().toString(),
      name: "",
      location: "",
      date: "",
      ticketPrice: "",
    });
  }
  setShowEventModal(true);
};


  const openUserModal = (user) => {
    setCurrentUser(user);
    setUserForm({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: name === "ticketPrice" ? Number(value) : value,
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!currentEvent;
    const url = isEdit
      ? `http://localhost:5000/api/events/update/${eventForm.id}`
      : "http://localhost:5000/api/events/create";

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(eventForm),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Event submit error:", data);
        alert(data.message || "Failed to save event");
        return;
      }

      fetchEvents();
      setShowEventModal(false);
    } catch (err) {
      console.log("Event submit failed:", err);
      alert("Something went wrong.");
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    const url = `http://localhost:5000/api/users/userUpdate/${userForm.id}`;

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("User update error:", data);
        alert(data.message || "Failed to update user");
        return;
      }

      fetchUsers();
      setShowUserModal(false);
    } catch (err) {
      console.error("User update failed:", err);
      alert("Something went wrong.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/events/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete event error:", data);
        alert(data.message || "Failed to delete event");
        return;
      }

      fetchEvents();
    } catch (err) {
      console.error("Delete event failed:", err);
      alert("Something went wrong.");
    }
  };

  const handleDeleteUser = async (id) => {  

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/users/userDelete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete user error:", data);
        alert(data.message || "Failed to delete user");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.log("Delete user failed:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("events")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "events"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Events Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab("cars")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "cars"
               ? "border-blue-500 text-blue-600"
               : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                >
                 Car Owners
            </button>
          </nav>
        </div>

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Events</h2>
              <button
                onClick={() => openEventModal()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
              >
                Add Event
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {event.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${event.ticketPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openEventModal(event)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Users</h2>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openUserModal(user)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cars Tab Content */}

        {activeTab === "cars" && (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Cars & Owners</h2>
          <div className="bg-white shadow overflow-hidden rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cars.map((car) => (
              <tr key={car._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {car.owner?.firstName} {car.owner?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {car.owner?.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Array.isArray(car.events) && car.events.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                    {car.events.map(ev => (
                      <span
                        key={ev._id}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                   >
                  {ev.name} ({ev.date ? new Date(ev.date).toLocaleDateString() : ""})
                  </span>
                  ))}
              </div>
              ) : (
              <span className="text-gray-400 italic">No events</span>
             )}
              </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No cars found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
      </div> 


      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {currentEvent ? "Edit Event" : "Add New Event"}
              </h3>
            </div>

            <form onSubmit={handleEventSubmit}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Event Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={eventForm.name}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="location"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={eventForm.location}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="date"
                  >
                    Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={eventForm.date}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="ticketPrice"
                  >
                    Ticket Price ($)
                  </label>
                  <input
                    id="ticketPrice"
                    name="ticketPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={eventForm.ticketPrice}
                    onChange={handleEventChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
                >
                  {currentEvent ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
            </div>

            <form onSubmit={handleUserSubmit}>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="firstName"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={userForm.firstName}
                      onChange={handleUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="lastName"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={userForm.lastName}
                      onChange={handleUserChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userForm.email}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="phoneNumber"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={userForm.phoneNumber}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

           
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
