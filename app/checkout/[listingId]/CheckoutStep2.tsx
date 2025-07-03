'use client';

import Heading from '@/app/components/Heading';
import Button from '@/app/components/Button';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CheckoutStep2: React.FC<Props> = ({ onNext, onBack }) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-20">
      <Heading title="Mode de paiement" subtitle="Choisissez comment vous souhaitez payer." />
      <div className="mt-4 space-y-4">
        <div className="p-4 border rounded-lg">💳 Carte bancaire (à venir)</div>
        <div className="p-4 border rounded-lg">📱 Mobile Money</div>
        <div className="p-4 border rounded-lg">💵 Paiement à la livraison</div>
      </div>
      <div className="flex justify-between mt-6">
        <Button label="Retour" onClick={onBack} />
        <Button label="Suivant" onClick={onNext} />
      </div>
    </div>
  );
};

export default CheckoutStep2;
