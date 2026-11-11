import React from "react";
import Navbar from "./Navbar";
import Footer from "../pages/Footer";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default MainLayout