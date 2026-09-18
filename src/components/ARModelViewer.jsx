/**
 * ARModelViewer — reusable wrapper around <model-viewer> web component.
 * Used inside Electronics and Robotics experiments for AR circuit/arm views.
 * 
 * Props:
 * - src: string (URL to .glb file)
 * - alt: string
 * - poster: string (optional poster image)
 * - arEnabled: boolean (default true)
 * - className: string
 */
export default function ARModelViewer({
  src,
  alt = 'A 3D model',
  poster,
  arEnabled = true,
  className = '',
}) {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${className}`}>
      <model-viewer
        src={src}
        alt={alt}
        poster={poster}
        ar={arEnabled ? '' : undefined}
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
      >
        {arEnabled && (
          <button 
            slot="ar-button"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>📱</span>
            View in AR
          </button>
        )}
      </model-viewer>
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <span className="text-4xl block mb-2">📦</span>
            <p className="text-sm">3D Model Loading...</p>
            <p className="text-xs mt-1">Place in AR on supported devices</p>
          </div>
        </div>
      )}
    </div>
  )
}
