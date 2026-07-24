import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { crearProveedor, actualizarProveedor } from '../../api/inventario'
import { X } from 'lucide-react'

export default function ModalProveedor({ proveedor, onClose, onSuccess }) {
  const esEdicion = !!proveedor
  const [form, setForm] = useState({
    nombre: proveedor?.nombre || '',
    nit: proveedor?.nit || '',
    telefono: proveedor?.telefono || '',
    correo: proveedor?.correo || '',
    direccion: proveedor?.direccion || '',
    personaContacto: proveedor?.personaContacto || '',
    notas: proveedor?.notas || '',
  })
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: (datos) => esEdicion
      ? actualizarProveedor(proveedor.id, datos)
      : crearProveedor(datos),
    onSuccess,
    onError: (err) => setError(err.response?.data?.mensaje || 'Error al guardar'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.nombre) { setError('El nombre es obligatorio'); return }
    mutate(form)
  }

  const campo = (label, name, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {campo('Nombre *', 'nombre')}
          <div className="grid grid-cols-2 gap-3">
            {campo('NIT', 'nit')}
            {campo('Teléfono', 'telefono', 'tel')}
          </div>
          {campo('Correo', 'correo', 'email')}
          {campo('Dirección', 'direccion')}
          {campo('Persona de contacto', 'personaContacto')}
          {campo('Notas', 'notas')}
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {isPending ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}