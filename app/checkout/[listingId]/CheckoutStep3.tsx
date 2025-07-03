'use client';

import Heading from '@/app/components/Heading';
import Button from '@/app/components/Button';
// Make sure the Textarea component exists at the specified path or update the import path accordingly.
// Example: If the correct path is '@/app/components/Textarea', update as follows:
// Update the import path below to the correct location of your Textarea component.
// For example, if the file is named 'Textarea.tsx' and is in the same folder as Button and Heading:
import Textarea from "@/app/components/inputs/Textarea";

// If the file is named differently or in another folder, update the path accordingly, e.g.:
// import Textarea from '@/app/components/FormTextarea';
// import Textarea from '../../components/Textarea';

interface Props {
  message: string;
  setMessage: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const CheckoutStep3: React.FC<Props> = ({ message, setMessage, onNext, onBack }) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-20">
      <Heading title="Message à l'hôte" subtitle="Ajoutez un message facultatif à votre hôte." />
      <Textarea
        id="host-message"
        label="Message à l'hôte"
        placeholder="Par exemple : Nous arriverons vers 20h, merci !"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-between mt-6">
        <Button label="Retour" onClick={onBack} />
        <Button label="Suivant" onClick={onNext} />
      </div>
    </div>
  );
};

export default CheckoutStep3;
