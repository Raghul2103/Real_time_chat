import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-shimmer rounded-xl ${className}`}></div>
  );
};

export default Skeleton;
