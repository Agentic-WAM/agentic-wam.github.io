// Figure 3 content, transcribed from code_label_pipeline_v2_0926.pdf.
export const PRIMITIVE_APIS = [
  "pick(object_name, side)",
  "place(object_name, target_name, side)",
  "rotate(object_name, axis, angle_deg, side)",
  "handover(object_name, from_side, to_side)",
  "move_arm(side, direction, distance=None)",
  "goto_relative(side, object_name, relation, clearance=None)",
];

export const ANNOTATION_PROGRAM = `robot.close_hand('left')
robot.release('right')
robot.rotate('bag of laundry powder',
    'vertical', 180.0, 'left')
robot.grasp('bag of laundry powder',
    'right')
robot.release('left')`;

export const POUR_SKILL = `def tilt_pour_over_target(
    robot, vessel_name, target_name, side,
    aim_delta, approach_rpy, tilt_deg=90.0
):
    target = robot.detect_objects_oneshot(target_name)
    robot.move_arm(
        side,
        target.data['detections'][0]['position_3d'],
        approach_rpy)
    robot.servo_ee_delta(side, aim_delta)
    robot.rotate(vessel_name, tilt_deg, side)
    robot.rotate(vessel_name, -tilt_deg, side)`;

// Viewports select the four original photos without their rasterized labels.
export const ANNOTATION_SKILLS = [
  { id: "free-hand", name: "free_hand_and_pick", viewport: "16 16 884 476" },
  { id: "pour", name: "tilt_pour_over_target", viewport: "916 16 868 476" },
  { id: "two-handed", name: "move_item_two_handed", viewport: "16 600 884 492" },
  { id: "bring", name: "pick_and_bring", viewport: "900 600 884 492" },
];
