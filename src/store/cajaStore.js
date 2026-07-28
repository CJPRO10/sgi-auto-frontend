import { create } from 'zustand'

const useCajaStore = create((set) => ({
  cajaAbierta: false,
  sesionId: null,
  cargando: true,

  setCajaAbierta: (abierta, sesionId = null) =>
    set({ cajaAbierta: abierta, sesionId, cargando: false }),

  cerrarCaja: () => set({ cajaAbierta: false, sesionId: null, cargando: false }),
}))

export default useCajaStore