import React from "react"
import { Routes, Route } from "react-router-dom"
import MainDashboard from "./components/dashboards/MainDashboard"
import MainLayout from "./components/MainLayout"
import Home from "./pages/Home"
import Services from "./pages/Services"
import Contact from "./pages/Contact"
import About from "./pages/About"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUP"
import ProtectedRoute from "./components/ProtectedRoute"


function App() {
     
     return (
    <>
     <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Dashboard */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <MainDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
         
    </>
  )
  }
  

 

export default App
