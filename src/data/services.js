// Shared service catalog — used by both the pricing section (Services.jsx)
// and the booking flow, so there's one place to edit prices/features.
export const services = [
  {
    id: 'interior-detail',
    name: 'Interior Detail',
    price: 'from $99',
    description: "Perfect for refreshing and restoring your vehicle's interior.",
    features: [
      'Full interior vacuum',
      'Dashboard, console & trim cleaning',
      'Carpet & floor mat cleaning',
      'Interior window cleaning',
    ],
  },
  {
    id: 'exterior-detail',
    name: 'Exterior Detail',
    price: 'from $89',
    description: "Restore your vehicle's shine with a professional exterior detail.",
    features: [
      'Hand wash & dry',
      'Wheel & tire cleaning',
      'Tire shine',
      'Exterior window cleaning',
    ],
  },
  {
    id: 'full-detail',
    name: 'Full Detail Package',
    price: 'from $169',
    description: 'Complete interior and exterior detailing for a showroom-ready finish.',
    features: [
      'Everything in the Interior Detail package',
      'Everything in the Exterior Detail package',
      'Priority scheduling',
    ],
    highlight: true,
  },
]

// Optional add-on services, shown below the core pricing cards.
// To add a future service (e.g. Pet Hair Removal, Stain Extraction,
// Headlight Restoration), just append another entry to this array —
// the layout adapts automatically as more items are added.
export const addOns = [
  {
    icon: '🛡️',
    name: 'Ceramic Protection',
    description:
      "Long-lasting ceramic protection to help keep your vehicle cleaner and protect its finish.",
    badge: 'Coming Soon',
  },
]

// Vehicle types offered as a choice during booking.
export const vehicleTypes = [
  'Sedan / Coupe',
  'SUV / Crossover',
  'Truck',
  'Minivan',
  'Other',
]
