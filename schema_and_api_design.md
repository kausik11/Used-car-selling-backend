# Used Car Platform - Database Schema and API Design (MongoDB)

This document defines a normalized MongoDB schema (using separate collections + references) and REST endpoints for the used car listing platform.

## Database Schema
```json
{
  "collections": {
    "car_listings": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "status": "enum(draft, active, sold, archived)",
      "visibility": "enum(public, private, hidden)",
      "title": "string",
      "brand": "string",
      "model": "string",
      "variant": "string",
      "fuel_type": "enum(petrol, diesel, electric, hybrid, cng, lpg)",
      "transmission": "enum(manual, automatic, amt, cvt, dct)",
      "body_type": "enum(hatchback, sedan, suv, muv, coupe, convertible, pickup, van)",
      "make_year": "int",
      "registration_year": "int",
      "ownership": "enum(first, second, third, fourth_plus)",
      "rto_code": "string",
      "state": "string",
      "kms_driven": "int",
      "insurance_valid_till": "date",
      "insurance_type": "enum(comprehensive, third_party, zero_dep, none)",
      "city": "string",
      "area": "string",
      "delivery_available": "bool",
      "test_drive_available": "bool",
      "reasons_to_buy": "[string]",
      "highlights": "[string]",
      "overall_score": "number",
      "inspection_summary": {
        "core_systems": "enum(excellent, good, fair, poor)",
        "supporting_systems": "enum(excellent, good, fair, poor)",
        "interiors_ac": "enum(excellent, good, fair, poor)",
        "exteriors_lights": "enum(excellent, good, fair, poor)",
        "wear_and_tear": "enum(excellent, good, fair, poor)"
      },
      "dimensions_capacity_id": "ObjectId (ref dimensions_capacity)",
      "engine_transmission_id": "ObjectId (ref engine_transmission)",
      "fuel_performance_id": "ObjectId (ref fuel_performance)",
      "suspension_steering_brakes_id": "ObjectId (ref suspension_steering_brakes)",
      "booking_policy_id": "ObjectId (ref booking_policy)",
      "price": {
        "amount": "number",
        "currency": "string"
      },
      "created_at": "date",
      "updated_at": "date"
    },

    "inspection_modules": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "module": "string",
      "components": [
        {
          "name": "string",
          "condition": "enum(ok, attention, replace)",
          "issues": "[string]"
        }
      ],
      "created_at": "date",
      "updated_at": "date"
    },

    "tyres": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "front": {
        "brand": "string",
        "size": "string",
        "condition": "enum(new, good, fair, poor)",
        "tread_mm": "number"
      },
      "rear": {
        "brand": "string",
        "size": "string",
        "condition": "enum(new, good, fair, poor)",
        "tread_mm": "number"
      },
      "spare": {
        "brand": "string",
        "size": "string",
        "condition": "enum(new, good, fair, poor)",
        "tread_mm": "number"
      },
      "created_at": "date",
      "updated_at": "date"
    },

    "media": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "images": [
        {
          "url": "string",
          "kind": "enum(exterior, interior, engine, tyres, other)",
          "sort_order": "int"
        }
      ],
      "inspection_report": {
        "url": "string",
        "type": "enum(pdf, image)"
      },
      "created_at": "date",
      "updated_at": "date"
    },

    "dimensions_capacity": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "ground_clearance_mm": "int",
      "boot_space_litres": "int",
      "seating_rows": "int",
      "seating_capacity": "int",
      "wheelbase_mm": "int",
      "length_mm": "int",
      "width_mm": "int",
      "height_mm": "int",
      "number_of_doors": "int",
      "front_tyre_size": "string",
      "rear_tyre_size": "string",
      "alloy_wheels": "bool",
      "created_at": "date",
      "updated_at": "date"
    },

    "engine_transmission": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "drivetrain": "enum(fwd, rwd, awd, 4wd)",
      "gearbox": "string",
      "number_of_gears": "int",
      "displacement_cc": "int",
      "number_of_cylinders": "int",
      "valves_per_cylinder": "int",
      "created_at": "date",
      "updated_at": "date"
    },

    "fuel_performance": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "mileage_arai_kmpl": "number",
      "max_power": "string",
      "max_torque": "string",
      "created_at": "date",
      "updated_at": "date"
    },

    "suspension_steering_brakes": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "suspension_front": "string",
      "suspension_rear": "string",
      "steering_type": "string",
      "steering_adjustment": "string",
      "brakes": "string",
      "created_at": "date",
      "updated_at": "date"
    },

    "booking_policy": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "booking_enabled": "bool",
      "cta_text": "string",
      "refund_policy": "string",
      "refund_condition": "string",
      "created_at": "date",
      "updated_at": "date"
    },

    "car_features": {
      "_id": "ObjectId",
      "car_id": "UUID",
      "safety": {
        "abs": "bool",
        "airbags": "enum(none, driver, dual, curtain, multiple)",
        "rear_camera": "bool",
        "parking_sensors": "enum(none, rear, front_rear)",
        "traction_control": "bool",
        "hill_assist": "bool"
      },
      "comfort": {
        "climate_control": "bool",
        "rear_ac": "bool",
        "power_steering": "bool",
        "power_windows": "enum(none, front, all)",
        "keyless_entry": "bool",
        "cruise_control": "bool",
        "sunroof": "enum(none, standard, panoramic)"
      },
      "entertainment": {
        "touchscreen": "bool",
        "bluetooth": "bool",
        "android_auto": "bool",
        "apple_carplay": "bool",
        "speakers": "int"
      },
      "interior": {
        "upholstery": "enum(fabric, leather, leatherette)",
        "adjustable_headrests": "bool",
        "ambient_lighting": "bool"
      },
      "exterior": {
        "fog_lamps": "bool",
        "led_headlamps": "bool",
        "roof_rails": "bool",
        "rear_wiper": "bool"
      },
      "created_at": "date",
      "updated_at": "date"
    }
  },

  "relations": {
    "car_listings.car_id": [
      "inspection_modules.car_id",
      "tyres.car_id",
      "media.car_id",
      "dimensions_capacity.car_id",
      "engine_transmission.car_id",
      "fuel_performance.car_id",
      "suspension_steering_brakes.car_id",
      "booking_policy.car_id",
      "car_features.car_id"
    ]
  },

  "indexes": {
    "car_listings": [
      { "car_id": "unique" },
      { "brand": 1, "model": 1 },
      { "make_year": -1 },
      { "registration_year": -1 },
      { "city": 1, "area": 1 },
      { "kms_driven": 1 },
      { "status": 1, "visibility": 1 },
      { "price.amount": 1 }
    ],
    "inspection_modules": [
      { "car_id": 1, "module": 1 }
    ],
    "tyres": [
      { "car_id": 1 }
    ],
    "media": [
      { "car_id": 1 }
    ],
    "car_features": [
      { "car_id": 1 }
    ]
  }
}
```

## API Endpoints
```json
{
  "base_url": "/api/v1",
  "endpoints": [
    {
      "method": "POST",
      "path": "/cars",
      "description": "Create a car listing"
    },
    {
      "method": "PATCH",
      "path": "/cars/{car_id}",
      "description": "Update a car listing"
    },
    {
      "method": "DELETE",
      "path": "/cars/{car_id}",
      "description": "Delete a car listing (soft delete to archived)"
    },
    {
      "method": "GET",
      "path": "/cars/{car_id}",
      "description": "Get a single car listing"
    },
    {
      "method": "GET",
      "path": "/cars",
      "description": "List and filter cars",
      "query_params": [
        "brand",
        "model",
        "variant",
        "make_year",
        "registration_year",
        "city",
        "kms_min",
        "kms_max",
        "price_min",
        "price_max",
        "fuel_type",
        "transmission",
        "body_type",
        "features[]",
        "status",
        "visibility",
        "page",
        "limit",
        "sort"
      ]
    },
    {
      "method": "POST",
      "path": "/cars/{car_id}/media",
      "description": "Upload media (images or inspection report)"
    }
  ]
}
```

## Example Payloads
```json
{
  "create_car_listing_request": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "status": "active",
    "visibility": "public",
    "title": "2019 Honda City V CVT",
    "brand": "Honda",
    "model": "City",
    "variant": "V CVT",
    "fuel_type": "petrol",
    "transmission": "cvt",
    "body_type": "sedan",
    "make_year": 2019,
    "registration_year": 2020,
    "ownership": "first",
    "rto_code": "DL01",
    "state": "Delhi",
    "kms_driven": 34000,
    "insurance_valid_till": "2026-07-31",
    "insurance_type": "comprehensive",
    "city": "Delhi",
    "area": "Saket",
    "delivery_available": true,
    "test_drive_available": true,
    "reasons_to_buy": ["Single owner", "Full service history"],
    "highlights": ["Sunroof", "Reverse camera"],
    "overall_score": 8.6,
    "inspection_summary": {
      "core_systems": "good",
      "supporting_systems": "good",
      "interiors_ac": "excellent",
      "exteriors_lights": "good",
      "wear_and_tear": "fair"
    },
    "dimensions_capacity": {
      "ground_clearance_mm": 165,
      "boot_space_litres": 510,
      "seating_rows": 2,
      "seating_capacity": 5,
      "wheelbase_mm": 2600,
      "length_mm": 4440,
      "width_mm": 1695,
      "height_mm": 1495,
      "number_of_doors": 4,
      "front_tyre_size": "175/65 R15",
      "rear_tyre_size": "175/65 R15",
      "alloy_wheels": true
    },
    "engine_transmission": {
      "drivetrain": "fwd",
      "gearbox": "CVT",
      "number_of_gears": 7,
      "displacement_cc": 1498,
      "number_of_cylinders": 4,
      "valves_per_cylinder": 4
    },
    "fuel_performance": {
      "mileage_arai_kmpl": 17.4,
      "max_power": "119 bhp @ 6600 rpm",
      "max_torque": "145 Nm @ 4600 rpm"
    },
    "suspension_steering_brakes": {
      "suspension_front": "MacPherson Strut",
      "suspension_rear": "Torsion Beam",
      "steering_type": "Electric",
      "steering_adjustment": "Tilt",
      "brakes": "Disc/Drum"
    },
    "booking_policy": {
      "booking_enabled": true,
      "cta_text": "Book Now",
      "refund_policy": "100% refund within 48 hours",
      "refund_condition": "If car fails post-booking inspection"
    },
    "features": {
      "safety": {
        "abs": true,
        "airbags": "dual",
        "rear_camera": true,
        "parking_sensors": "rear",
        "traction_control": false,
        "hill_assist": false
      },
      "comfort": {
        "climate_control": true,
        "rear_ac": true,
        "power_steering": true,
        "power_windows": "all",
        "keyless_entry": true,
        "cruise_control": false,
        "sunroof": "standard"
      },
      "entertainment": {
        "touchscreen": true,
        "bluetooth": true,
        "android_auto": true,
        "apple_carplay": true,
        "speakers": 4
      },
      "interior": {
        "upholstery": "leatherette",
        "adjustable_headrests": true,
        "ambient_lighting": false
      },
      "exterior": {
        "fog_lamps": true,
        "led_headlamps": false,
        "roof_rails": false,
        "rear_wiper": false
      }
    },
    "inspection_modules": [
      {
        "module": "engine",
        "components": [
          { "name": "Oil leakage", "condition": "ok", "issues": [] },
          { "name": "Engine noise", "condition": "attention", "issues": ["Minor ticking"] }
        ]
      }
    ],
    "tyres": {
      "front": { "brand": "MRF", "size": "175/65 R15", "condition": "good", "tread_mm": 6.5 },
      "rear": { "brand": "MRF", "size": "175/65 R15", "condition": "good", "tread_mm": 6.0 },
      "spare": { "brand": "MRF", "size": "175/65 R15", "condition": "fair", "tread_mm": 4.0 }
    },
    "price": { "amount": 825000, "currency": "INR" }
  },

  "create_car_listing_response": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "status": "active",
    "visibility": "public",
    "created_at": "2026-02-09T10:20:30.000Z",
    "updated_at": "2026-02-09T10:20:30.000Z"
  },

  "update_car_listing_request": {
    "status": "sold",
    "visibility": "hidden",
    "price": { "amount": 799000, "currency": "INR" },
    "highlights": ["Single owner", "New tyres"]
  },

  "update_car_listing_response": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "status": "sold",
    "visibility": "hidden",
    "updated_at": "2026-02-09T11:45:10.000Z"
  },

  "delete_car_listing_response": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "status": "archived",
    "updated_at": "2026-02-09T12:10:00.000Z"
  },

  "get_car_listing_response": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "status": "active",
    "visibility": "public",
    "title": "2019 Honda City V CVT",
    "brand": "Honda",
    "model": "City",
    "variant": "V CVT",
    "fuel_type": "petrol",
    "transmission": "cvt",
    "body_type": "sedan",
    "make_year": 2019,
    "registration_year": 2020,
    "ownership": "first",
    "rto_code": "DL01",
    "state": "Delhi",
    "kms_driven": 34000,
    "insurance_valid_till": "2026-07-31",
    "insurance_type": "comprehensive",
    "city": "Delhi",
    "area": "Saket",
    "delivery_available": true,
    "test_drive_available": true,
    "reasons_to_buy": ["Single owner", "Full service history"],
    "highlights": ["Sunroof", "Reverse camera"],
    "overall_score": 8.6,
    "inspection_summary": {
      "core_systems": "good",
      "supporting_systems": "good",
      "interiors_ac": "excellent",
      "exteriors_lights": "good",
      "wear_and_tear": "fair"
    },
    "dimensions_capacity": {
      "ground_clearance_mm": 165,
      "boot_space_litres": 510,
      "seating_rows": 2,
      "seating_capacity": 5,
      "wheelbase_mm": 2600,
      "length_mm": 4440,
      "width_mm": 1695,
      "height_mm": 1495,
      "number_of_doors": 4,
      "front_tyre_size": "175/65 R15",
      "rear_tyre_size": "175/65 R15",
      "alloy_wheels": true
    },
    "engine_transmission": {
      "drivetrain": "fwd",
      "gearbox": "CVT",
      "number_of_gears": 7,
      "displacement_cc": 1498,
      "number_of_cylinders": 4,
      "valves_per_cylinder": 4
    },
    "fuel_performance": {
      "mileage_arai_kmpl": 17.4,
      "max_power": "119 bhp @ 6600 rpm",
      "max_torque": "145 Nm @ 4600 rpm"
    },
    "suspension_steering_brakes": {
      "suspension_front": "MacPherson Strut",
      "suspension_rear": "Torsion Beam",
      "steering_type": "Electric",
      "steering_adjustment": "Tilt",
      "brakes": "Disc/Drum"
    },
    "booking_policy": {
      "booking_enabled": true,
      "cta_text": "Book Now",
      "refund_policy": "100% refund within 48 hours",
      "refund_condition": "If car fails post-booking inspection"
    },
    "features": {
      "safety": {
        "abs": true,
        "airbags": "dual",
        "rear_camera": true,
        "parking_sensors": "rear",
        "traction_control": false,
        "hill_assist": false
      },
      "comfort": {
        "climate_control": true,
        "rear_ac": true,
        "power_steering": true,
        "power_windows": "all",
        "keyless_entry": true,
        "cruise_control": false,
        "sunroof": "standard"
      },
      "entertainment": {
        "touchscreen": true,
        "bluetooth": true,
        "android_auto": true,
        "apple_carplay": true,
        "speakers": 4
      },
      "interior": {
        "upholstery": "leatherette",
        "adjustable_headrests": true,
        "ambient_lighting": false
      },
      "exterior": {
        "fog_lamps": true,
        "led_headlamps": false,
        "roof_rails": false,
        "rear_wiper": false
      }
    },
    "inspection_modules": [
      {
        "module": "engine",
        "components": [
          { "name": "Oil leakage", "condition": "ok", "issues": [] },
          { "name": "Engine noise", "condition": "attention", "issues": ["Minor ticking"] }
        ]
      }
    ],
    "tyres": {
      "front": { "brand": "MRF", "size": "175/65 R15", "condition": "good", "tread_mm": 6.5 },
      "rear": { "brand": "MRF", "size": "175/65 R15", "condition": "good", "tread_mm": 6.0 },
      "spare": { "brand": "MRF", "size": "175/65 R15", "condition": "fair", "tread_mm": 4.0 }
    },
    "media": {
      "images": [
        { "url": "https://cdn.example.com/cars/1.jpg", "kind": "exterior", "sort_order": 1 }
      ],
      "inspection_report": { "url": "https://cdn.example.com/cars/report.pdf", "type": "pdf" }
    },
    "price": { "amount": 825000, "currency": "INR" },
    "created_at": "2026-02-09T10:20:30.000Z",
    "updated_at": "2026-02-09T10:20:30.000Z"
  },

  "list_cars_response": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "items": [
      {
        "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
        "title": "2019 Honda City V CVT",
        "brand": "Honda",
        "model": "City",
        "variant": "V CVT",
        "make_year": 2019,
        "registration_year": 2020,
        "city": "Delhi",
        "kms_driven": 34000,
        "price": { "amount": 825000, "currency": "INR" },
        "status": "active",
        "visibility": "public"
      },
      {
        "car_id": "4c4c87d1-05e5-4f4f-9f98-c3dd9300c7d3",
        "title": "2018 Maruti Swift ZXI",
        "brand": "Maruti",
        "model": "Swift",
        "variant": "ZXI",
        "make_year": 2018,
        "registration_year": 2019,
        "city": "Mumbai",
        "kms_driven": 52000,
        "price": { "amount": 545000, "currency": "INR" },
        "status": "active",
        "visibility": "public"
      }
    ]
  },

  "upload_media_request": {
    "files": [
      { "name": "front.jpg", "kind": "exterior" },
      { "name": "report.pdf", "kind": "inspection_report" }
    ]
  },

  "upload_media_response": {
    "car_id": "b6ab6b1c-1f4a-4e2f-9d64-2ad2d0bd9f1a",
    "images": [
      { "url": "https://cdn.example.com/cars/front.jpg", "kind": "exterior", "sort_order": 1 }
    ],
    "inspection_report": { "url": "https://cdn.example.com/cars/report.pdf", "type": "pdf" },
    "updated_at": "2026-02-09T12:30:00.000Z"
  }
}
```
