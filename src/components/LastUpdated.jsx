import React, { useState, useEffect } from 'react';

const LastUpdated = ({ storageKey }) => {
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    // Read initial from local storage
    const stored = localStorage.getItem(`lastUpdated_${storageKey}`);
    if (stored) setTimestamp(new Date(stored));

    const handleUpdate = () => {
      const newStored = localStorage.getItem(`lastUpdated_${storageKey}`);
      if (newStored) setTimestamp(new Date(newStored));
    };

    // Listen for custom event
    const eventName = `timestampUpdated_${storageKey}`;
    window.addEventListener(eventName, handleUpdate);
    return () => window.removeEventListener(eventName, handleUpdate);
  }, [storageKey]);

  if (!timestamp) {
    return <span>Last Updated: Never</span>;
  }

  const formattedDate = timestamp.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const formattedTime = timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });

  return <span>Last Updated: {formattedDate} | {formattedTime}</span>;
};

export default LastUpdated;
