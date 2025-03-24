import { createContext, useContext, useState } from "react"
import { createPortal } from "react-dom"

const ModalContext = createContext<{
  modal: React.ReactNode | null
  open: boolean
  setModal: (modal: React.ReactNode) => void
  setOpen: (open: boolean) => void
} | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<React.ReactNode | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <ModalContext.Provider value={{ modal, open, setModal, setOpen }}>
      {children}
      {open &&
        modal &&
        createPortal(
          <div className="fixed top-0 left-0 w-screen h-screen z-50 bg-black bg-opacity-50 flex items-center justify-center">
            {modal}
          </div>,
          document.getElementById("modals")!
        )}
    </ModalContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModal(
  modalContent: (close: () => void, opened: boolean) => React.ReactNode,
  { onOpen, onClose }: { onOpen?: () => void; onClose?: () => void } = {}
) {
  const { open, setModal, setOpen } = useContext(ModalContext)!

  const modal = modalContent(() => setOpen(false), open)

  const openModal = () => {
    setModal(modal)
    setOpen(true)
    onOpen?.()
  }

  const closeModal = () => {
    setOpen(false)
    onClose?.()
  }

  const toggleModal = () => {
    if (open) {
      setOpen(false)
      onClose?.()
    } else {
      setModal(modal)
      setOpen(true)
      onOpen?.()
    }
  }

  return { toggleModal, openModal, closeModal, opened: open }
}
