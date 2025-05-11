import React from 'react';

const SidebarLink = ({ to, icon, text }) => {
  return (
    <a href={to} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </a>
  );
};

export default SidebarLink;