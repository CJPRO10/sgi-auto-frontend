export default function Placeholder({ titulo }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700">{titulo}</h2>
        <p className="text-gray-400 mt-2">Módulo en construcción</p>
      </div>
    </div>
  )
}