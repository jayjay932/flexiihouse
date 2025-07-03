'use client';

import { useState } from 'react';
import { SafeListing, SafeReservation, SafeUser } from '@/app/types';
import CheckoutStep1 from './CheckoutStep1';
import CheckoutStep2 from './CheckoutStep2';
import CheckoutStep3 from './CheckoutStep3';
import CheckoutStep4 from './CheckoutStep4';
import { Range } from 'react-date-range';

interface CheckoutStepsWrapperProps {
  listing: SafeListing;
  currentUser: SafeUser | null;
  reservations: SafeReservation[];
}

const initialDateRange: Range = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection'
};

const CheckoutStepsWrapper: React.FC<CheckoutStepsWrapperProps> = ({
  listing,
  currentUser,
  reservations
}) => {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = listing.price * (
    (dateRange.endDate && dateRange.startDate)
      ? Math.max(1, Math.floor((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1
  );

  const goNext = () => setStep((prev) => prev + 1);
  const goBack = () => setStep((prev) => prev - 1);

  return (
    <>
      {step === 1 && (
        <CheckoutStep1
          listing={listing}
          currentUser={currentUser}
          dateRange={dateRange}
          totalPrice={totalPrice}
          onChangeDate={setDateRange}
          onNext={goNext}
        />
      )}
      {step === 2 && (
        <CheckoutStep2
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 3 && (
        <CheckoutStep3
          onNext={goNext}
          onBack={goBack}
          message={message}
          setMessage={setMessage}
        />
      )}
      {step === 4 && (
        <CheckoutStep4
          listing={listing}
          currentUser={currentUser}
          dateRange={dateRange}
          totalPrice={totalPrice}
          message={message}
          isLoading={isLoading}
          onBack={goBack}
        />
      )}
    </>
  );
};

export default CheckoutStepsWrapper;
