import { vehicleTypes } from '../../data/services'
import { choiceCardClass, secondaryButtonClass } from './shared'

export default function VehicleStep({ value, onSelect, onBack }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-white mb-1">What type of vehicle?</h3>
      <p className="text-sm text-white/50 mb-6">This helps us prepare the right equipment.</p>

      <div className="grid gap-3 sm:grid-cols-3">
        {vehicleTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={choiceCardClass(value === type)}
          >
            <p className="font-medium text-white text-sm">{type}</p>
          </button>
        ))}
      </div>

      <button type="button" onClick={onBack} className={`${secondaryButtonClass} mt-8`}>
        Back
      </button>
    </div>
  )
}
