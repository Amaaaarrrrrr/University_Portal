import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarLink = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 text-gray-700 transition-colors rounded-lg hover:bg-blue-50 ${
          isActive
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-gray-700'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </NavLink>
  );
};

export default SidebarLink;
