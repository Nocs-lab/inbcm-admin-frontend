import { useEffect } from "react"
import { useStore } from "../utils/store"

export const useTitle = () => {
  const { user } = useStore()

  useEffect(() => {
    const getTitle = () => {
      switch (user?.perfil) {
        case "admin":
          return "INBCM - Módulo de gestão"
        case "analyst":
          return "INBCM - Módulo analista"
        default:
          return "INBCM"
      }
    }

    document.title = getTitle()
  }, [user?.perfil])
}
