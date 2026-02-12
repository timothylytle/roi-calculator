'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';

export default function EmbedNavigation({
  activeCalculator,
  searchParamsString,
}) {
  const router = useRouter();
  const querySuffix = useMemo(() => {
    if (!searchParamsString) {
      return '';
    }
    return searchParamsString.startsWith('?')
      ? searchParamsString
      : `?${searchParamsString}`;
  }, [searchParamsString]);

  const handleCalculatorChange = (nextCalculator) => {
    router.replace(`/embed/${nextCalculator}${querySuffix}`);
  };

  return (
    <Navigation
      activeCalculator={activeCalculator}
      onCalculatorChange={handleCalculatorChange}
      withinContainer
    />
  );
}
