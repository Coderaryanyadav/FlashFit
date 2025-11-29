'use client';

import { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationPermissionProps {
  onEnable: () => void;
  onManual: () => void;
}

export default function LocationPermission({ onEnable, onManual }: LocationPermissionProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const permissionStatus = localStorage.getItem('locationPermission');
      if (!permissionStatus) {
        setShow(true);
      }
    }
  }, []);

  const handleEnable = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          localStorage.setItem('locationPermission', 'enabled');
          setShow(false);
          onEnable();
        },
        () => {
          localStorage.setItem('locationPermission', 'denied');
          onManual();
        }
      );
    } else {
      onManual();
    }
  };

  const handleManual = () => {
    localStorage.setItem('locationPermission', 'manual');
    setShow(false);
    onManual();
  };

  const handleClose = () => {
    localStorage.setItem('locationPermission', 'dismissed');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Location permission not enabled</h2>
          <p className="text-gray-400 text-sm">
            Please enable location permission for a better delivery experience
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnable}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
          >
            Enable location
          </button>
          <button
            onClick={handleManual}
            className="w-full text-blue-400 text-sm py-2 hover:text-blue-300"
          >
            Set location manually
          </button>
        </div>
      </div>
    </div>
  );
}
