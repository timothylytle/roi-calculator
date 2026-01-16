'use client';

import { useState, useRef, useEffect } from 'react';

export default function Navigation({ activeCalculator, onCalculatorChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculators = [
    {
      id: 'revenue',
      name: 'Revenue Intelligence',
      description: 'Sales conversion ROI',
      color: 'sky'
    },
    {
      id: 'cx',
      name: 'CX Intelligence',
      description: 'Customer retention ROI',
      color: 'emerald'
    }
  ];

  const handleSelect = (id) => {
    onCalculatorChange(id);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6 text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-64 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600">ROI Calculators</h3>
          </div>
          <div className="p-2">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => handleSelect(calc.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeCalculator === calc.id
                    ? calc.color === 'sky'
                      ? 'bg-sky-50 border-2 border-sky-500'
                      : 'bg-emerald-50 border-2 border-emerald-500'
                    : 'hover:bg-slate-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      calc.color === 'sky' ? 'bg-sky-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <p className={`font-semibold ${
                      activeCalculator === calc.id ? 'text-slate-800' : 'text-slate-700'
                    }`}>
                      {calc.name}
                    </p>
                    <p className="text-sm text-slate-500">{calc.description}</p>
                  </div>
                  {activeCalculator === calc.id && (
                    <svg
                      className={`w-5 h-5 ml-auto ${
                        calc.color === 'sky' ? 'text-sky-500' : 'text-emerald-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
