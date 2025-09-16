"use client";
import { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../Button";


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

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) return;
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [onSubmit, disabled]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) return null;

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
      <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto h-full lg:h-auto md:h-auto">
        {/* CONTENT */}
        <div
          className={`translate duration-300 h-full ${
            showModal ? "translate-y-0" : "translate-y-full"
          } ${showModal ? "opacity-100" : "opacity-0"}`}
        >
          <div className="rounded-t-2xl md:rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-full md:h-auto">
            {/* HEADER */}
            <div className="flex items-center p-6 rounded-t justify-center relative border-b-[1px] flex-shrink-0">
              <button
                className="p-1 border-0 hover:opacity-70 transition absolute left-9"
                onClick={handleClose}
              >
                <CloseIcon size={18} />
              </button>
              <div className="text-lg font-semibold">{title}</div>
            </div>

            {/* BODY */}
            <div className="relative p-6 flex-1 overflow-y-auto pb-[100px] md:pb-6 md:max-h-[calc(85vh-160px)]">
              {body}
            </div>

            {/* FOOTER (décalé au-dessus de la BottomNav) */}
            <div className="fixed bottom-16 left-0 right-0 w-full bg-white border-t px-6 py-4 z-50 md:sticky md:bottom-0 md:z-10">
              <div className="flex flex-row items-center gap-4 w-full">
                {secondaryAction && secondaryActionLabel && (
                  <Button
                    disabled={disabled}
                    label={secondaryActionLabel}
                    onClick={handleSecondaryAction}
                    outline
                  />
                )}
                <Button
                  disabled={disabled}
                  label={actionLabel}
                  onClick={handleSubmit}
                />
              </div>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
