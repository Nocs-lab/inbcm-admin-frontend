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

export function useModal() {
  const { open, setModal: setContextModal, setOpen } = useContext(ModalContext)!

  const setModalContent = (modalContent: React.ReactNode) => {
    setContextModal(modalContent)
  }

  const openModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
  }

  const toggleModal = () => {
    setOpen(!open)
  }

  return { toggleModal, openModal, closeModal, setModalContent }
}
