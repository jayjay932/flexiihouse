'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import Button from '../Button';

const CloseIcon = IoMdClose as unknown as React.FC<{ size?: number; className?: string }>;

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel: string;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

/**
 * Modal retravaillé (look Airbnb/Apple):
 * - Overlay avec blur et fade
 * - Conteneur doux (rounded-2xl, ombres subtiles), transitions scale/opacity
 * - Header plus aéré, bouton close accessible
 * - Body avec grande respiration et mieux géré pour le scroll
 * - Footer sticky (mobile: fixed + safe-area, desktop: sticky) type Airbnb
 * - A11y: role="dialog", aria-modal, Escape pour fermer, clic en dehors
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondaryAction,
  secondaryActionLabel,
}) => {
  const [showModal, setShowModal] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setShowModal(isOpen), [isOpen]);

  // Fermer avec ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) return;
    setShowModal(false);
    setTimeout(() => onClose(), 250);
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [disabled, secondaryAction]);

  // Clic en dehors
  const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    if (e.target instanceof Node && !panelRef.current.contains(e.target)) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayMouseDown}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 backdrop-blur-[2px] transition-colors"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full sm:w-5/6 md:w-4/6 lg:w-3/6 xl:w-[42%] 2xl:w-[38%] mx-auto px-4 sm:px-6">
        {/* Panel */}
        <div
          ref={panelRef}
          className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-250 sm:my-8 ${
            showModal ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.98] translate-y-3'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200/70 px-6 py-5">
            <button
              onClick={handleClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400/60 transition"
              aria-label="Fermer"
            >
              <CloseIcon size={18} />
            </button>
            <h2 id="modal-title" className="flex-1 text-center text-lg sm:text-xl font-semibold text-neutral-900">
              {title}
            </h2>
            {/* Espace pour équilibrer le bouton de gauche */}
            <span className="inline-block h-9 w-9" />
          </div>

          {/* Body */}
          <div className="relative max-h-[72vh] overflow-y-auto px-6 py-6 sm:py-8">
            {body}
            {/* Espace de réserve pour le footer fixe mobile */}
            <div className="block sm:hidden h-24" />
          </div>

          {/* Footer */}
          {/* Desktop (>= sm): sticky à l'intérieur du panel */}
          <div className="hidden sm:block sticky bottom-0 border-t border-neutral-200/70 bg-white/90 backdrop-blur px-6 py-4">
            <div className="flex flex-row items-center gap-4 w-full">
              {secondaryAction && secondaryActionLabel && (
                <Button disabled={disabled} label={secondaryActionLabel} onClick={handleSecondaryAction} outline />
              )}
              <Button disabled={disabled} label={actionLabel} onClick={handleSubmit} />
            </div>
            {footer}
          </div>
        </div>

        {/* Mobile footer fixé au bas de l'écran, au-dessus de la BottomNav (si présente) */}
        <div className="sm:hidden fixed left-0 right-0 bottom-0 z-[60]">
          <div className="mx-4 mb-[max(16px,env(safe-area-inset-bottom))] rounded-2xl border border-neutral-200/70 bg-white/95 backdrop-blur px-4 py-4 shadow-lg">
            <div className="flex flex-row items-center gap-3">
              {secondaryAction && secondaryActionLabel && (
                <Button disabled={disabled} label={secondaryActionLabel} onClick={handleSecondaryAction} outline />
              )}
              <Button disabled={disabled} label={actionLabel} onClick={handleSubmit} />
            </div>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
