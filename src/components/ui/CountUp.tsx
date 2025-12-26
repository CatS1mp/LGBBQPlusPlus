import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';

interface CountUpProps {
  to: number;
  duration?: number;
  separator?: string;
  style?: TextStyle;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  duration = 1.5,
  separator = ',',
  style,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(0);
    const steps = Math.max(1, Math.floor(duration * 60));
    const stepValue = to / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const nextValue = Math.min(Math.floor(stepValue * currentStep), to);
      setDisplayValue(nextValue);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(to);
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(timer);
  }, [to, duration]);

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return <Text style={style}>{formatNumber(displayValue)}</Text>;
};

export default CountUp;

