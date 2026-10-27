import React from "react"
import { Routes, Route } from "react-router-dom"
import MainDashboard from "./components/dashboards/MainDasboard"
import MainLayout from "./components/MainLayout"
import Home from "./pages/Home"
import Services from "./pages/Services"
import Contact from "./pages/Contact"
import About from "./pages/About"


function App() {
     
     return (
    <>
     <Routes>
       <Route element={<MainLayout />}>
            <Route path="/contact" element={<Contact />}/>
            <Route path="/" element={<Home />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/login" element={<Services />}/>
        </Route>
        <Route path="/dashboard/*" element={<MainDashboard />}/>
       
     </Routes>
         
    </>
  )
  }
  

 

export default App
