import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a13] text-slate-100">
      {children}
    </div>
  );
};

export default DashboardLayout;
