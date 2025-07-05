"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"

const SpectatorPage = () => {
  const [events, setEvents] = useState([])
  const [allCars, setAllCars] = useState([])
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}")

  useEffect(() => {
    fetchEvents()
    fetchAllCars()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/events/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Failed to fetch events:", data)
        throw new Error(data.message || "Error fetching events")
      }

      console.log("events : ", data)
      setEvents(data)
    } catch (err) {
      console.log("Fetch events error:", err.message)
      setError("Failed to load events. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllCars = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/cars/all-cars", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Failed to fetch cars:", data)
        throw new Error(data.message || "Error fetching cars")
      }

      console.log("all cars: ", data)
      setAllCars(data)
    } catch (err) {
      console.log("Fetch cars error:", err.message)
      setError("Failed to load car information. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    Cookies.remove("token")
    window.location.href = "/login"
  }

  const hasTicketsForEvent = (event) => {
    return event.spectators?.some((spectator) => spectator.email === user.email)
  }

  const getTicketCount = (event) => {
    return event.spectators?.filter((spectator) => spectator.email === user.email).length || 0
  }

  const openEventDetails = (event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const openBuyTicketModal = (event) => {
    setSelectedEvent(event)
    setShowBuyTicketModal(true)
    setTicketQuantity(1)
  }

  const handleBuyTicket = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const res = await fetch(`http://localhost:5000/api/events/buy-ticket/${selectedEvent._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ userId: user._id, quantity: ticketQuantity }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to buy ticket")
      }

      alert("Tickets purchased successfully!")
      setShowBuyTicketModal(false)
      fetchEvents()
    } catch (error) {
      console.error("Ticket purchase error:", error)
      alert(`Failed to buy tickets: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Get registered cars for an event based on carsRegistered IDs
  const getRegisteredCars = (event) => {
    if (!event || !event.carsRegistered || !allCars.length) return []

    return event.carsRegistered
      .map((carObj) => {
        // Handle both cases: if carsRegistered contains objects with _id or just strings
        const carId = typeof carObj === "object" ? carObj._id : carObj
        return allCars.find((car) => car._id === carId)
      })
      .filter((car) => car !== undefined) // Filter out any undefined cars (in case ID doesn't match)
  }

  // Helper function to check if a car is registered for an event
  const isCarRegistered = (eventId, carId) => {
    const event = events.find((e) => e._id === eventId)
    if (!event || !event.carsRegistered) return false

    return event.carsRegistered.some((carObj) => {
      const registeredCarId = typeof carObj === "object" ? carObj._id : carObj
      return registeredCarId === carId
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Spectator Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button onClick={() => setError("")} className="float-right font-bold">
              ×
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">Loading...</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Events</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Ticket Price:</span> ${event.ticketPrice}
                    </p>
                    <p>
                      <span className="font-medium">Registered Cars:</span> {event.carsRegistered?.length || 0}
                    </p>
                  </div>

                  {hasTicketsForEvent(event) && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                      <p className="text-green-800 text-sm font-medium">
                        ✓ You have {getTicketCount(event)} ticket(s) for this event
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => openEventDetails(event)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openBuyTicketModal(event)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                      disabled={loading}
                    >
                      Buy Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {events.length === 0 && !loading && (
              <div className="col-span-full text-center py-8 text-gray-500">No events available at the moment.</div>
            )}
          </div>
        </div>

        {/* My Tickets */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Tickets</h2>

          {events.filter((e) => hasTicketsForEvent(e)).length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">You haven't purchased any tickets yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.filter(hasTicketsForEvent).map((event) => (
                      <tr key={event._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{event.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{getTicketCount(event)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          ${event.ticketPrice * getTicketCount(event)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy Ticket Modal */}
      {showBuyTicketModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <form onSubmit={handleBuyTicket}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Buy Tickets</h3>
                  <button
                    type="button"
                    onClick={() => setShowBuyTicketModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedEvent.name}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.location} - {new Date(selectedEvent.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Ticket Price: ${selectedEvent.ticketPrice}</p>
                  </div>

          

                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-900">
                      Total: ${selectedEvent.ticketPrice * ticketQuantity}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEventDetails(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close event details"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedEvent.name}</h2>
            <p className="mb-2">
              <strong>Location:</strong> {selectedEvent.location}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
            </p>
            <p className="mb-4">
              <strong>Ticket Price:</strong> ${selectedEvent.ticketPrice}
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Registered Cars : {selectedEvent.carsRegistered?.length || 0}</h3>
              
            </div>

            {hasTicketsForEvent(selectedEvent) && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Your Tickets</h3>
                <p className="text-green-700">You have {getTicketCount(selectedEvent)} ticket(s) for this event.</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEventDetails(false)
                  openBuyTicketModal(selectedEvent)
                }}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Buy Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpectatorPage
