const mongoose = require('mongoose');
const applyRequireAllFields = require('./utils/requireAllFields');

const FeatureItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const SafetyDescriptionsSchema = new mongoose.Schema(
  {
    anti_theft_device: { type: String },
    engine_immobilizer: { type: String },
    esp: { type: String },
    tpms: { type: String },
    hill_hold_control: { type: String },
  },
  { _id: false }
);

const ComfortDescriptionsSchema = new mongoose.Schema(
  {
    keyless_entry: { type: String },
    keyless_start: { type: String },
    cruise_control: { type: String },
    tailgate_ajar_warning: { type: String },
  },
  { _id: false }
);

const EntertainmentDescriptionsSchema = new mongoose.Schema(
  {
    android_auto: { type: String },
    apple_carplay: { type: String },
    gps_navigation_system: { type: String },
  },
  { _id: false }
);

const CarFeaturesSchema = new mongoose.Schema(
  {
    car_id: { type: String, required: true, unique: true, index: true },
    safety: {
      abs: { type: Boolean },
      airbags: { type: String, enum: ['none', 'driver', 'dual', 'curtain', 'multiple'] },
      airbag_count: { type: Number },
      engine_immobilizer: {
        type: Boolean,
        description:
          'An engine immobilizer prevents the engine from starting unless the correct key or transponder is detected.',
      },
      anti_theft_device: {
        type: Boolean,
        description:
          'An anti-theft device is a security system in a vehicle designed to prevent theft by deterring unauthorized access, starting, or movement of the car.',
      },
      central_locking: { type: Boolean },
      headlight_height_adjuster: { type: Boolean },
      seat_belt_warning: { type: Boolean },
      ebd: { type: Boolean },
      speed_sensing_central_door_locking: { type: Boolean },
      power_door_locks: { type: Boolean },
      child_safety_lock: { type: Boolean },
      low_fuel_level_warning: { type: Boolean },
      door_ajar_warning: { type: Boolean },
      speed_alert: { type: Boolean },
      steering_airbag: { type: Boolean },
      co_passenger_airbag: { type: Boolean },
      safety_rating: { type: Number },
      safety_rating_type: {
        type: String,
        enum: ['Global NCAP', 'Bharat NCAP', 'ASEAN NCAP', 'Euro NCAP', 'NHTSA', 'IIHS'],
      },
      automatic_parking_assist: { type: Boolean },
      esp: {
        type: Boolean,
        description:
          'Electronic Stability Program helps the car stay stable by reducing skids during sudden turns or slippery conditions.',
      },
      knee_airbags: { type: Boolean },
      brake_assist: { type: Boolean },
      view_camera_360: { type: Boolean },
      rear_camera: { type: Boolean },
      active_roll_mitigation: { type: Boolean },
      automatic_head_lamps: { type: Boolean },
      cornering_headlights: { type: Boolean },
      follow_me_home_headlamps: { type: Boolean },
      tpms: {
        type: Boolean,
        description: 'Tyre Pressure Monitoring System alerts the driver when tyre pressure is too low.',
      },
      hill_hold_control: {
        type: Boolean,
        description:
          'Hill hold control prevents the car from rolling backward on slopes when moving from brake to accelerator.',
      },
      parking_sensors: { type: String, enum: ['none', 'rear', 'front_rear'] },
      child_seat_anchor_points: { type: Boolean },
      headlight_ignition_off_reminder: { type: Boolean },
      middle_rear_three_point_seatbelt: { type: Boolean },
      second_row_middle_rear_headrest: { type: Boolean },
      geo_fence_alert: { type: Boolean },
      side_airbags: { type: Boolean },
      front_torso_airbags: { type: Boolean },
      rear_torso_airbags: { type: Boolean },
      traction_control: { type: Boolean },
      hill_assist: { type: Boolean },
      descriptions: { type: SafetyDescriptionsSchema, default: undefined },
      custom: { type: [FeatureItemSchema], default: [] },
    },
    comfort: {
      wireless_phone_charging: { type: Boolean },
      air_quality_control_filter: { type: Boolean },
      climate_control: { type: Boolean },
      automatic_climate_control: { type: Boolean },
      rear_ac: { type: Boolean },
      second_row_ac_vent: { type: Boolean },
      power_steering: { type: Boolean },
      air_conditioner: { type: Boolean },
      outlets_12v: { type: Boolean },
      power_windows: { type: String, enum: ['none', 'front', 'all'] },
      keyless_start: {
        type: Boolean,
        description:
          'Keyless start lets you start or stop the engine using a button instead of a traditional key slot.',
      },
      keyless_entry: {
        type: Boolean,
        description:
          'Keyless entry lets you lock or unlock the car without taking the key out of your pocket.',
      },
      cruise_control: {
        type: Boolean,
        description:
          'Cruise control maintains a constant speed without continuous accelerator input on long drives.',
      },
      driver_height_adjustable_seat: { type: Boolean },
      steering_mounted_controls: { type: Boolean },
      armrest: { type: Boolean },
      folding_rear_seat: { type: Boolean },
      rear_seat_centre_arm_rest: { type: Boolean },
      seat_adjustment: { type: Boolean },
      glove_compartment: { type: Boolean },
      adjustable_orvm: { type: Boolean },
      seat_lumbar_support: { type: Boolean },
      cup_holders: { type: Boolean },
      trunk_cargo_lights: { type: Boolean },
      gear_indicator: { type: Boolean },
      rear_reading_lamp: { type: Boolean },
      tailgate_ajar_warning: {
        type: Boolean,
        description: 'Tailgate ajar warning alerts the driver if the boot door is not fully closed.',
      },
      digital_clock: { type: Boolean },
      voice_command_control: { type: Boolean },
      third_row_cup_holders: { type: Boolean },
      driver_ventilated_seat: { type: Boolean },
      electrically_adjustable_orvm: { type: Boolean },
      ventilated_seats: { type: Boolean },
      electrically_adjustable_driver_seat: { type: Boolean },
      second_row_ventilated_seat: { type: Boolean },
      steering_wheel_gearshift_paddles: { type: Boolean },
      outside_temperature_display: { type: Boolean },
      glove_box_cooling: { type: Boolean },
      find_my_car_location: { type: Boolean },
      lane_change_indicator: { type: Boolean },
      rear_curtain: { type: Boolean },
      real_time_vehicle_tracking: { type: Boolean },
      remote_fuel_lid_opener: { type: Boolean },
      window_blind: { type: Boolean },
      active_noise_cancellation: { type: Boolean },
      luggage_hook_and_net: { type: Boolean },
      air_suspension: { type: Boolean },
      sunroof: { type: String, enum: ['none', 'standard', 'panoramic'] },
      descriptions: { type: ComfortDescriptionsSchema, default: undefined },
      custom: { type: [FeatureItemSchema], default: [] },
    },
    entertainment: {
      touchscreen_infotainment_system: { type: Boolean },
      touchscreen: { type: Boolean },
      gps_navigation_system: {
        type: Boolean,
        description: 'GPS navigation system provides turn-by-turn route guidance using satellite positioning.',
      },
      bluetooth: { type: Boolean },
      bluetooth_compatibility_connectivity: { type: Boolean },
      usb_compatibility_connectivity: { type: Boolean },
      am_fm_radio: { type: Boolean },
      integrated_in_dash_music_system: { type: Boolean },
      android_auto: {
        type: Boolean,
        description:
          'Android Auto connects Android phones for maps, calls, music, and voice controls on the infotainment screen.',
      },
      apple_carplay: {
        type: Boolean,
        description:
          'Apple CarPlay connects iPhones for navigation, calls, messages, and media via the infotainment system.',
      },
      aux_compatibility_connectivity: { type: Boolean },
      dvd_player: { type: Boolean },
      ipod_compatibility: { type: Boolean },
      internal_storage_hard_drive: { type: Boolean },
      number_of_speakers: { type: Number },
      speakers: { type: Number },
      descriptions: { type: EntertainmentDescriptionsSchema, default: undefined },
      custom: { type: [FeatureItemSchema], default: [] },
    },
    interior: {
      rear_passenger_seat_type: {
        type: String,
        enum: ['fixed', 'folding', 'split_folding', 'captain'],
      },
      front_seat_pockets: { type: Boolean },
      door_pockets: { type: Boolean },
      seat_upholstery_type: { type: String, enum: ['fabric', 'leather', 'leatherette'] },
      digital_tripmeter: { type: Boolean },
      interior_colours: { type: [String], default: [] },
      upholstery: { type: String, enum: ['fabric', 'leather', 'leatherette'] },
      headrests: { type: Boolean },
      interior_door_handles: { type: Boolean },
      digital_cockpit: { type: Boolean },
      leather_wrapped_gear_knob_shift_selector: { type: Boolean },
      leather_wrapped_steering_wheel: { type: Boolean },
      digital_tachometer: { type: Boolean },
      digital_odometer: { type: Boolean },
      digital_instrument_cluster: { type: Boolean },
      adjustable_headrests: { type: Boolean },
      ambient_lighting: { type: Boolean },
      custom: { type: [FeatureItemSchema], default: [] },
    },
    exterior: {
      sunroof: { type: Boolean },
      fog_lamps: { type: Boolean },
      led_headlamps: { type: Boolean },
      roof_rails: { type: Boolean },
      rear_wiper: { type: Boolean },
      rear_defogger: { type: Boolean },
      outside_rear_view_mirrors_orvms: { type: Boolean },
      rear_power_window: { type: Boolean },
      turn_indicators_on_orvm: { type: Boolean },
      tail_lamps_leds: { type: Boolean },
      chrome_exhaust: { type: Boolean },
      chrome_front_grille: { type: Boolean },
      integrated_antenna: { type: Boolean },
      tinted_window_glass: { type: Boolean },
      rain_sensing_wipers: { type: Boolean },
      removable_convertible_top: { type: Boolean },
      dual_tone_body_colors: { type: Boolean },
      roof_carrier: { type: Boolean },
      side_stepper: { type: Boolean },
      xenon_hid_headlamps: { type: Boolean },
      rear_spoiler: { type: Boolean },
      electronic_spoiler: { type: Boolean },
      custom: { type: [FeatureItemSchema], default: [] },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

applyRequireAllFields(CarFeaturesSchema);

module.exports = mongoose.model('CarFeatures', CarFeaturesSchema);
