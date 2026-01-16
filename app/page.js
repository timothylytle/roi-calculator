'use client';

import { useState } from 'react';
import ROICalculator from './components/ROICalculator';
import CXCalculator from './components/CXCalculator';
import Navigation from './components/Navigation';

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState('revenue');

  return (
    <>
      <Navigation
        activeCalculator={activeCalculator}
        onCalculatorChange={setActiveCalculator}
      />
      {activeCalculator === 'revenue' ? <ROICalculator /> : <CXCalculator />}
    </>
  );
}
