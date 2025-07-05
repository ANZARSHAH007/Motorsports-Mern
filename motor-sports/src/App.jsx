import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/login'
import Signup from './pages/Signup'
import AdminPage from './pages/Admin'
import CarOwnerPage from './pages/CarOwner'
import SpectatorPage from './pages/Spectator'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  const router = createBrowserRouter([  
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <Signup />,
    },
    {
      path: "admin",
      element: <AdminPage />,
    },
    {
      path: "car-owner",
      element: <CarOwnerPage />,
    },
    {
      path: "spectator",
      element: <SpectatorPage />,
    },
    {
      path: "*",
      element: (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">404 - Not found</h1>
            <p className="mb-6 text-gray-600">Go back to login page</p>
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go back
            </a>
          </div>
        </div>
      ),
    },
  ]);

  return (
    <div className="font-sans">
      <RouterProvider router={router} />
    </div>
  );
}

export default App