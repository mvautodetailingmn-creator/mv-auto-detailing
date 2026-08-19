import { services } from '../../data/services'
import { choiceCardClass } from './shared'

export default function ServiceStep({ value, onSelect }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-white mb-1">Choose a service</h3>
      <p className="text-sm text-white/50 mb-6">Select the detailing package you'd like to book.</p>

      <div className="grid gap-3 sm:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={choiceCardClass(value?.id === service.id)}
          >
            <p className="font-semibold text-white">{service.name}</p>
            <p className="mt-1 text-electric text-sm font-medium">{service.price}</p>
            <p className="mt-2 text-xs text-white/50 leading-relaxed">{service.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
