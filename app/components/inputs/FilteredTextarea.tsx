'use client';

import { useState, useEffect } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { validateDescription, FilterResult } from '@/app/utils/contentFilter';

interface FilteredTextareaProps {
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const FilteredTextarea: React.FC<FilteredTextareaProps> = ({
  id,
  label,
  disabled,
  required,
  register,
  errors,
  placeholder,
  value,
  onChange
}) => {
  const [filterResult, setFilterResult] = useState<FilterResult>({ 
    isValid: true, 
    errors: [], 
    cleanedText: '' 
  });
  const [currentValue, setCurrentValue] = useState(value || '');

  useEffect(() => {
    if (currentValue) {
      const result = validateDescription(currentValue);
      setFilterResult(result);
    } else {
      setFilterResult({ isValid: true, errors: [], cleanedText: '' });
    }
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    
    // Valider en temps réel
    const result = validateDescription(newValue);
    setFilterResult(result);
    
    // Appeler onChange si fourni
    if (onChange) {
      onChange(newValue);
    }
  };

  const getCharacterCount = () => {
    return currentValue.length;
  };

  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count > 500) return 'text-red-500';
    if (count > 400) return 'text-orange-500';
    return 'text-gray-500';
  };

  // Validation personnalisée qui combine les erreurs de formulaire et de filtre
  const hasErrors = errors[id] || !filterResult.isValid;

  return (
    <div className="w-full">
      <label className={`text-md font-medium ${hasErrors ? 'text-red-500' : 'text-zinc-700'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative mt-2">
        <textarea
          id={id}
          disabled={disabled}
          {...register(id, { 
            required: required ? `${label} est requis` : false,
            validate: (value) => {
              if (!value && !required) return true; // Si vide et pas requis, c'est ok
              if (!value && required) return `${label} est requis`;
              
              const result = validateDescription(value);
              if (!result.isValid) {
                return `Contenu non autorisé: ${result.errors.join(' | ')}`;
              }
              return true;
            },
            onChange: (e) => {
              handleChange(e);
            }
          })}
          placeholder={placeholder || `Décrivez votre ${label.toLowerCase()}...`}
          value={currentValue}
          onChange={handleChange}
          rows={4}
          maxLength={600}
          className={`
            peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition resize-none
            ${hasErrors ? 'border-red-500' : 'border-neutral-300'}
            ${hasErrors ? 'focus:border-red-500' : 'focus:border-black'}
            ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* Compteur de caractères */}
      <div className="flex justify-between items-center mt-2">
        <div className={`text-sm ${getCharacterColor()}`}>
          {getCharacterCount()}/600 caractères
        </div>
        
        {getCharacterCount() > 500 && (
          <div className="text-sm text-orange-500">
            ⚠️ Limite recommandée dépassée
          </div>
        )}
      </div>

      {/* Erreurs de validation */}
      {hasErrors && (
        <div className="mt-2 space-y-1">
          {errors[id] && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              ❌ {errors[id]?.message?.toString()}
            </p>
          )}
          
          {!filterResult.isValid && filterResult.errors.map((error, index) => (
            <div key={index} className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Message de succès */}
      {filterResult.isValid && currentValue.length > 0 && !errors[id] && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
          ✅ Description conforme aux règles
        </div>
      )}

      {/* Conseils d'écriture */}
      {currentValue.length === 0 && !errors[id] && (
        <div className="mt-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="font-medium mb-2">💡 Conseils pour une bonne description :</div>
          <ul className="space-y-1 text-xs">
            <li>• Décrivez l'ambiance et le style de votre logement</li>
            <li>• Mentionnez les équipements principaux</li>
            <li>• Évitez les informations de contact (téléphone, email, réseaux sociaux)</li>
            <li>• Ne donnez pas d'adresse précise ou d'indications détaillées</li>
            <li>• Restez professionnel et accueillant</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilteredTextarea;