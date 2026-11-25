import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "../pages/Footer";
import Sidebar from "./Sidebar"; 

const SIDEBAR_ROLES = new Set(["admin", "teacher", "student", "parent"]);

function MainLayout({ userRole, children }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== userRole && lastPart !== "dashboard") {
      setActiveTab(lastPart);
    } else if (parts.includes("dashboard")) {
      setActiveTab("overview");
    }
  }, [location.pathname, userRole]);

  const normalizedRole =
    userRole ||
    location.pathname.split("/").find((seg) => SIDEBAR_ROLES.has(seg));

  if (normalizedRole && SIDEBAR_ROLES.has(normalizedRole)) {
    const content = children
      ? React.isValidElement(children)
        ? React.cloneElement(children, { activeTab, setActiveTab })
        : children
      : <Outlet />;

    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#faf5ff] text-[#10002b]">
        <Sidebar
          userRole={normalizedRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1 min-w-0">
          {content}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {children ?? <Outlet />}
      <Footer />
    </>
  );
}

export default MainLayout;