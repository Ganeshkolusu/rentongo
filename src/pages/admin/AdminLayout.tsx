import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Vehicle Approvals", end: true },
  { to: "/admin/plans", label: "Plan Pricing" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/vehicles", label: "All Vehicles" },
  { to: "/admin/bookings", label: "All Bookings" },
  { to: "/admin/subscriptions", label: "Subscriptions" },
];

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="md:w-56 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 md:min-h-screen">
        <h2 className="text-lg font-black text-gray-900 mb-4 px-2">Super Admin</h2>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
