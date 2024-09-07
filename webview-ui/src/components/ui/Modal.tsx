import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog open={isOpen} as="div" className="relative z-20 focus:outline-none" onClose={onClose}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel transition className="w-full max-w-md rounded-md bg-neutral-800 p-4">
            <div className="mx-auto w-full">
              <div className="flex flex-row justify-between items-center">
                <DialogTitle as="h3" className="text-base font-semibold text-white">
                  {title}
                </DialogTitle>
                <button
                  type="button"
                  className="p-0.5 rounded-md text-neutral-400 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-800"
                  onClick={onClose}>
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="size-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4">{children}</div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
