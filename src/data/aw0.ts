// All numbers, names and texts on the page come from the AW-0 paper
// (DexWAM/our-paper-arxiv). Update them here, not in the components.

// ---------------------------------------------------------------------------
// Links. `null` renders the button as "coming soon" (not clickable).
// ---------------------------------------------------------------------------
export const LINKS = {
  paper: null as string | null, // TODO: arXiv abs URL once the paper is posted
  code: null as string | null, // TODO: GitHub repository URL
};

// Hero teaser video (like T-Rex's hero_short.mp4). While it is null the hero
// shows a muted mosaic of the eight real-world task episodes instead.
export const HERO_VIDEO: string | null = null;

// ---------------------------------------------------------------------------
// Authors (order, marks and affiliations as in the arXiv title block).
// `url: null` = no homepage yet (TODO), rendered as plain text.
// ---------------------------------------------------------------------------
export type Author = { name: string; marks: string; url: string | null };
export const AUTHORS: Author[] = [
  { name: "Zhuoyang Liu", marks: "1*", url: "https://zhuoyang-liu.github.io/" },
  { name: "Dantong Niu", marks: "1,2*‡", url: "https://dantong88.github.io/" },
  { name: "Botong Zhang", marks: "3*", url: null },
  { name: "Boning Shao", marks: "1*", url: "https://www.linkedin.com/in/boning-shao/" },
  { name: "Jing Wang", marks: "2", url: "https://scholar.google.com/citations?hl=en&user=cdL5PqgAAAAJ" },
  { name: "Ruijie Zheng", marks: "2", url: "https://ruijiezheng.com/" },
  { name: "Yuvan Sharma", marks: "2", url: "https://yuvansharma.github.io/" },
  { name: "Runyu Lu", marks: "2", url: null },
  { name: "Jiaming Liu", marks: "2", url: null },
  { name: "Renrui Zhang", marks: "3", url: null },
  { name: "Roei Herzig", marks: "1", url: "https://roeiherz.github.io/" },
  { name: "Yutong Bai", marks: "1", url: "https://yutongbai.com/" },
  { name: "Ken Goldberg", marks: "1", url: "https://www2.eecs.berkeley.edu/Faculty/Homepages/goldberg.html" },
  { name: "Danfei Xu", marks: "2", url: "https://faculty.cc.gatech.edu/~danfei/" },
  { name: "Yuke Zhu", marks: "2", url: "https://yukezhu.me/" },
  { name: "Guanzhi Wang", marks: "2†", url: null },
  { name: "Linxi “Jim” Fan", marks: "2†", url: "https://jimfan.me/" },
  { name: "Trevor Darrell", marks: "1†", url: "https://people.eecs.berkeley.edu/~trevor/" },
];

export const AFFILIATIONS = [
  { mark: "1", label: "UC Berkeley" },
  { mark: "2", label: "NVIDIA" },
  { mark: "3", label: "University of Pennsylvania" },
];

export const AUTHOR_NOTES = [
  { mark: "*", label: "Equal contribution" },
  { mark: "†", label: "Equal advising" },
  { mark: "‡", label: "Project leader" },
];

// TODO: add a University of Pennsylvania logo to public/images/logos/ and list it here.
export const LOGOS = [
  { alt: "UC Berkeley", src: "/images/logos/uc-berkeley-logo.png", w: 1064, h: 214 },
  { alt: "NVIDIA", src: "/images/logos/nvidia-logo.png", w: 2756, h: 540 },
];

// ---------------------------------------------------------------------------
// Pretraining corpus (Appendix, Table "Pretraining Corpus Statistics").
// ---------------------------------------------------------------------------
export const PRETRAIN_STATS = [
  { num: "2,913 h", label: "Robot + human video" },
  { num: "248,642", label: "Episodes" },
  { num: "606", label: "Tasks" },
  { num: "2.08M", label: "Aligned program slices" },
  { num: "50", label: "Reusable skills" },
];

// ---------------------------------------------------------------------------
// RoboTwin 2.0 (Table 1 + appendix per-task table). Success rate (%).
// ---------------------------------------------------------------------------
export type SimRow = { method: string; clean: number; random: number; avg: number; ours?: boolean };
export const ROBOTWIN_MAIN: SimRow[] = [
  { method: "π0.5", clean: 54.9, random: 27.7, avg: 41.3 },
  { method: "DreamZero", clean: 33.6, random: 17.6, avg: 25.6 },
  { method: "EgoScale", clean: 26.2, random: 2.9, avg: 14.5 },
  { method: "WLA", clean: 64.8, random: 3.6, avg: 34.2 },
  { method: "AW-0 (ours)", clean: 80.8, random: 20.6, avg: 50.7, ours: true },
  { method: "AW-0 (hybrid)", clean: 63.1, random: 29.2, avg: 46.2, ours: true },
];

export const ROBOTWIN_METHODS = ["π0.5", "EgoScale", "DreamZero", "WLA", "AW-0 (ours)", "AW-0 (hybrid)"];
// [task, clean/random pairs in ROBOTWIN_METHODS order]
export const ROBOTWIN_PER_TASK: [string, number[]][] = [
  ["Adjust Bottle", [62, 18, 26, 0, 0, 6, 100, 0, 100, 50, 90, 48]],
  ["Beat Block Hammer", [48, 16, 22, 0, 26, 12, 82, 0, 94, 28, 46, 24]],
  ["Blocks Ranking RGB", [74, 16, 0, 0, 0, 0, 54, 0, 96, 32, 94, 82]],
  ["Blocks Ranking Size", [32, 0, 0, 0, 16, 0, 32, 0, 56, 0, 64, 50]],
  ["Click Alarmclock", [44, 56, 88, 16, 100, 24, 100, 42, 96, 56, 100, 62]],
  ["Click Bell", [32, 40, 92, 36, 100, 66, 100, 48, 96, 18, 100, 72]],
  ["Dump Bin Bigbin", [72, 70, 32, 18, 0, 0, 100, 12, 98, 20, 78, 14]],
  ["Grab Roller", [94, 46, 96, 6, 64, 22, 100, 0, 100, 32, 92, 50]],
  ["Handover Block", [16, 0, 4, 0, 0, 0, 8, 0, 82, 0, 4, 0]],
  ["Handover Mic", [26, 4, 0, 0, 16, 0, 68, 0, 98, 12, 34, 2]],
  ["Hanging Mug", [10, 4, 0, 0, 0, 0, 8, 0, 30, 0, 2, 0]],
  ["Lift Pot", [8, 2, 0, 0, 8, 0, 88, 0, 90, 4, 66, 0]],
  ["Move Can Pot", [28, 0, 24, 0, 4, 4, 64, 0, 76, 6, 82, 52]],
  ["Move Pillbottle Pad", [60, 44, 36, 0, 34, 16, 72, 0, 92, 6, 96, 6]],
  ["Move Playingcard Away", [90, 52, 46, 0, 0, 4, 94, 0, 100, 46, 86, 30]],
  ["Move Stapler Pad", [22, 6, 0, 0, 0, 0, 2, 0, 38, 0, 26, 2]],
  ["Open Laptop", [68, 20, 20, 0, 66, 22, 90, 0, 84, 38, 72, 48]],
  ["Open Microwave", [26, 8, 8, 2, 12, 8, 0, 0, 20, 4, 46, 24]],
  ["Pick Diverse Bottles", [56, 18, 44, 0, 40, 16, 76, 12, 76, 36, 74, 32]],
  ["Pick Dual Bottles", [82, 14, 38, 4, 54, 42, 80, 0, 80, 28, 96, 28]],
  ["Place A2B Left", [60, 10, 0, 0, 22, 14, 48, 0, 84, 30, 98, 58]],
  ["Place A2B Right", [58, 14, 4, 0, 24, 8, 54, 0, 80, 26, 96, 80]],
  ["Place Bread Basket", [68, 44, 44, 0, 62, 12, 84, 0, 92, 20, 80, 6]],
  ["Place Bread Skillet", [86, 46, 32, 0, 36, 34, 64, 0, 90, 14, 24, 2]],
  ["Place Burger Fries", [90, 78, 78, 0, 70, 62, 100, 0, 94, 20, 66, 22]],
  ["Place Can Basket", [40, 0, 6, 0, 26, 12, 42, 6, 70, 8, 26, 8]],
  ["Place Cans Plasticbox", [94, 74, 40, 0, 0, 12, 100, 0, 98, 12, 80, 34]],
  ["Place Container Plate", [96, 58, 46, 0, 96, 44, 100, 0, 94, 26, 86, 22]],
  ["Place Dual Shoes", [54, 12, 8, 0, 20, 0, 32, 0, 64, 12, 2, 2]],
  ["Place Empty Cup", [74, 56, 72, 0, 76, 50, 94, 0, 98, 16, 96, 14]],
  ["Place Fan", [36, 30, 12, 0, 0, 0, 8, 0, 70, 4, 16, 10]],
  ["Place Mouse Pad", [18, 0, 2, 0, 10, 0, 26, 0, 64, 0, 18, 4]],
  ["Place Object Basket", [24, 4, 0, 0, 10, 0, 42, 2, 84, 14, 50, 4]],
  ["Place Object Scale", [58, 44, 8, 0, 36, 8, 36, 0, 70, 18, 88, 50]],
  ["Place Object Stand", [94, 40, 26, 0, 50, 26, 92, 6, 92, 26, 62, 56]],
  ["Place Phone Stand", [40, 4, 8, 0, 22, 0, 86, 0, 90, 22, 82, 54]],
  ["Place Shoe", [64, 24, 22, 6, 18, 6, 72, 0, 78, 22, 60, 30]],
  ["Press Stapler", [42, 32, 100, 20, 88, 44, 82, 0, 86, 8, 100, 68]],
  ["Put Bottles Dustbin", [14, 2, 0, 0, 4, 6, 16, 0, 86, 12, 14, 0]],
  ["Put Object Cabinet", [22, 0, 12, 0, 4, 0, 68, 0, 56, 6, 66, 0]],
  ["Rotate QRcode", [50, 2, 32, 0, 0, 0, 22, 0, 70, 4, 40, 28]],
  ["Scan Object", [62, 38, 4, 0, 40, 20, 80, 0, 68, 10, 16, 10]],
  ["Shake Bottle Horizontally", [98, 74, 72, 30, 100, 86, 100, 26, 100, 62, 100, 26]],
  ["Shake Bottle", [96, 72, 80, 6, 100, 76, 100, 24, 100, 58, 94, 30]],
  ["Stack Blocks Three", [68, 16, 0, 0, 10, 0, 12, 0, 92, 18, 62, 56]],
  ["Stack Blocks Two", [80, 56, 6, 0, 58, 46, 90, 0, 70, 18, 80, 82]],
  ["Stack Bowls Three", [38, 36, 0, 0, 14, 14, 88, 0, 78, 40, 44, 4]],
  ["Stack Bowls Two", [82, 44, 0, 0, 88, 24, 100, 0, 98, 56, 52, 44]],
  ["Stamp Seal", [32, 2, 6, 0, 40, 16, 40, 0, 78, 2, 58, 4]],
  ["Turn Switch", [56, 40, 12, 0, 14, 18, 42, 0, 44, 28, 52, 28]],
];
export const ROBOTWIN_PER_TASK_AVG = [54.9, 27.7, 26.2, 2.9, 33.6, 17.6, 64.8, 3.6, 80.8, 20.6, 63.1, 29.2];

// ---------------------------------------------------------------------------
// Real world (Table 2). Average rubric score (%) over 3x16 rollouts per task.
// ---------------------------------------------------------------------------
export type Platform = "yam" | "sharpa";
export const REAL_TASKS: { key: string; label: string; platform: Platform }[] = [
  { key: "arrange_fruits", label: "Arrange Fruits", platform: "yam" },
  { key: "pack_backpack", label: "Pack Backpack", platform: "yam" },
  { key: "replace_lightbulb", label: "Replace Lightbulb", platform: "yam" },
  { key: "fold_towels", label: "Fold Towels", platform: "yam" },
  { key: "fruits_with_tong", label: "Fruits w/ Tong", platform: "sharpa" },
  { key: "deal_poker", label: "Deal Poker", platform: "sharpa" },
  { key: "flip_scoreboard", label: "Flip Scoreboard", platform: "sharpa" },
  { key: "solve_cube", label: "Solve Cube", platform: "sharpa" },
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  yam: "YAM (parallel grippers)",
  sharpa: "Tianji–Sharpa (dexterous hands)",
};

export type RealRow = { method: string; vals: number[]; avg: number; ours?: boolean };
export const REAL_RESULTS: RealRow[] = [
  { method: "π0.5", vals: [70.8, 49.7, 63.8, 81.7, 7.3, 13.1, 26.3, 36.1], avg: 43.6 },
  { method: "DreamZero", vals: [53.3, 36.7, 67.4, 79.8, 22.6, 37.1, 28.4, 42.5], avg: 46.0 },
  { method: "EgoScale", vals: [37.5, 27.3, 60.2, 53.3, 17.6, 25.6, 40.8, 24.9], avg: 35.9 },
  { method: "WLA", vals: [39.6, 29.6, 56.0, 74.6, 14.2, 22.9, 29.7, 52.3], avg: 39.9 },
  { method: "AW-0 (ours)", vals: [91.7, 64.6, 75.0, 84.4, 54.2, 58.3, 68.8, 72.1], avg: 71.1, ours: true },
];

// ---------------------------------------------------------------------------
// Ablations (Section 4.3). Average rubric score (%), task order = REAL_TASKS.
// ---------------------------------------------------------------------------
export type Series = { name: string; color: string; vals: number[]; avg: number; ours?: boolean };

// Figure 5: attention order during joint denoising.
export const ABL_ATTENTION: Series[] = [
  { name: "C → V → A (ours)", color: "#8CB6D0", vals: [91.7, 64.6, 75.0, 84.4, 54.2, 58.3, 68.8, 72.1], avg: 71.1, ours: true },
  { name: "V → C → A", color: "#A2C27C", vals: [31.3, 29.1, 77.1, 60.8, 25.0, 52.1, 45.8, 65.3], avg: 48.3 },
  { name: "V → A (w/o code)", color: "#C2ABE3", vals: [27.1, 16.7, 47.9, 53.2, 10.4, 20.8, 39.6, 47.1], avg: 32.9 },
];

// Table 3: visual conditioning of the code expert.
export const ABL_VISUAL: Series[] = [
  { name: "ViT (ours)", color: "#8CB6D0", vals: [91.7, 64.6, 75.0, 84.4, 54.2, 58.3, 68.8, 72.1], avg: 71.1, ours: true },
  { name: "VAE", color: "#E9C77C", vals: [83.3, 39.6, 66.7, 61.3, 41.7, 47.9, 50.0, 53.9], avg: 55.6 },
];

// Figure 7: content of the code label.
export const ABL_LABEL: Series[] = [
  { name: "Code (ours)", color: "#8CB6D0", vals: [91.7, 64.6, 75.0, 84.4, 54.2, 58.3, 68.8, 72.1], avg: 71.1, ours: true },
  { name: "Code w/o comments", color: "#A2C27C", vals: [80.4, 52.1, 68.6, 80.1, 45.8, 47.5, 62.5, 65.7], avg: 62.8 },
  { name: "Code w/o skills", color: "#C2ABE3", vals: [90.2, 55.9, 65.5, 76.9, 48.9, 42.0, 63.7, 63.2], avg: 63.3 },
  { name: "Subgoal (language)", color: "#E9C77C", vals: [88.3, 56.3, 72.9, 78.2, 58.3, 43.8, 52.1, 59.2], avg: 63.6 },
];

// Table 4 + Figure 6: code generation paradigm and inference latency (RTX 5090).
export const ABL_GENERATION: Series[] = [
  { name: "Joint denoise (ours)", color: "#8CB6D0", vals: [91.7, 64.6, 75.0, 84.4, 54.2, 58.3, 68.8, 72.1], avg: 71.1, ours: true },
  { name: "Autoregressive (AR)", color: "#F2C29B", vals: [81.3, 62.5, 79.2, 53.2, 20.8, 44.1, 39.3, 55.8], avg: 54.5 },
];
export const LATENCY = [
  { name: "V → A (w/o code)", latency: 0.19, score: 32.9, color: "#C2ABE3" },
  { name: "Joint denoise (ours)", latency: 0.23, score: 71.1, color: "#8CB6D0", ours: true },
  { name: "Autoregressive (AR)", latency: 0.55, score: 54.5, color: "#F2C29B" },
];

// ---------------------------------------------------------------------------
// Grading rubrics (Appendix "Real-world Task Progress"), keyed by episode id.
// ---------------------------------------------------------------------------
export const RUBRICS: Record<string, { pts: string; text: string }[]> = {
  arrange_fruits: [
    { pts: "+0.3", text: "Moves each fruit not named in the instruction from the left bowl into the right basket (or none to remove)." },
    { pts: "+0.3", text: "Moves each named fruit not yet in the left bowl from the right basket into the bowl (or none to fetch)." },
    { pts: "+0.4", text: "Final state matches the instruction and no fruit is dropped." },
  ],
  pack_backpack: [
    { pts: "+0.15", text: "Left gripper grasps the zipper pull at the left end and slides it to the middle." },
    { pts: "+0.15", text: "Right gripper re-grasps the pull at the middle and slides it to the right end." },
    { pts: "+0.2", text: "Open the backpack with the left gripper." },
    { pts: "+0.2", text: "Picks up the item from the table and places it inside the open backpack." },
    { pts: "+0.15", text: "Right gripper grasps the pull at the right end and slides it back to the middle." },
    { pts: "+0.15", text: "Left gripper slides the pull from the middle to the left end; the backpack is fully closed with the item inside." },
  ],
  replace_lightbulb: [
    { pts: "+0.1", text: "Left gripper presses the inline switch and the bulb stays dark." },
    { pts: "+0.1", text: "Left gripper braces the lamp base." },
    { pts: "+0.2", text: "Right gripper unscrews the dead bulb and lifts it out of the socket." },
    { pts: "+0.1", text: "Dead bulb is set down in the bulb tray." },
    { pts: "+0.1", text: "Right gripper picks up the spare bulb." },
    { pts: "+0.3", text: "Spare bulb is seated in the socket and screwed in clockwise until lit." },
    { pts: "+0.1", text: "When the bulb is lit, release both arms to their home positions." },
  ],
  fold_and_stack_towels: [
    { pts: "+0.2", text: "Grasps a towel edge and completes one fold." },
    { pts: "+0.2", text: "Each of the three towels is folded flat." },
    { pts: "+0.1", text: "Picks a folded towel up and lays it on the pile." },
    { pts: "+0.2", text: "All three folded towels end up in a single pile, none dropped or left behind." },
    { pts: "+0.3", text: "The pile reads, bottom to top, in the colour order the instruction names." },
  ],
  arrange_fruits_sharpa: [
    { pts: "+0.2", text: "Right hand takes the tongs off their stand and keeps hold of them." },
    { pts: "+0.25", text: "Moves each fruit not named in the instruction from the left bowl into the tray (or none to remove)." },
    { pts: "+0.25", text: "Moves each named fruit not yet in the left bowl from the tray into the bowl (or none to fetch)." },
    { pts: "+0.2", text: "Final state matches the instruction and no fruit is dropped." },
    { pts: "+0.1", text: "Tongs are put back on their stand." },
  ],
  deal_poker: [
    { pts: "+0.1", text: "Right hand grasps the card stack from above." },
    { pts: "+0.2", text: "Right hand transfers the stack to the left hand (handover)." },
    { pts: "+0.3", text: "Right thumb flicks and adjusts until exactly one card protrudes from the top." },
    { pts: "+0.3", text: "Right hand grasps the single protruding card." },
    { pts: "+0.1", text: "Right hand inserts the card vertically into the card slot." },
  ],
  flip_scoreboard: [
    { pts: "+0.1", text: "Left hand holds the scoreboard steady." },
    { pts: "+0.2", text: "Right hand flips a digit card over (at least one complete flip)." },
    { pts: "+0.4", text: "Flips exactly k times, so the board shows the initial score plus k." },
    { pts: "+0.1", text: "Left hand releases the board." },
    { pts: "+0.2", text: "Right hand presses the red button while the target score is showing." },
  ],
  solve_rubiks_cube: [
    { pts: "+0.2", text: "Right hand grasps the cube and lifts it off the table." },
    { pts: "+0.3", text: "Fingers turn the scrambled layer a full quarter turn, leaving no layer half-turned." },
    { pts: "+0.3", text: "The cube is solved: every face shows a single colour." },
    { pts: "+0.2", text: "The cube is put back on the table and both hands let go." },
  ],
};

// ---------------------------------------------------------------------------
// Skill library (Appendix "Skill Library Definitions" + skill visualizations).
// ---------------------------------------------------------------------------
export type SkillSource = "yam" | "human";
export type SkillExample = {
  id: string;
  source: SkillSource;
  task: string;
  subgoal: string;
  definition: string;
  slice: string;
};

export const SKILL_EXAMPLES: SkillExample[] = [
  {
    id: "fold_edge_over",
    source: "yam",
    task: "wrap blanket roll with ribbon",
    subgoal: "Fold the blanket at the center of the board",
    definition: `def fold_edge_over(robot, item_name, left_delta, right_delta):
    # pinch the edge with both arms
    robot.grasp(item_name, 'left')
    robot.grasp(item_name, 'right')
    # carry the pinched edge across the item
    robot.servo_ee_delta('left', left_delta)
    robot.servo_ee_delta('right', right_delta)
    # let the fold lie
    robot.release('left')
    robot.release('right')`,
    slice: `fold_edge_over(robot, 'blanket', [0.15, 0.0, 0.0], [0.15, 0.0, 0.0])`,
  },
  {
    id: "alternating_smoothing_pats",
    source: "yam",
    task: "roll towels",
    subgoal: "Flatten the towel",
    definition: `def alternating_smoothing_pats(robot, fabric_name, first_side, second_side):
    # pat 1 -- press the fabric flat, then come off
    robot.grasp(fabric_name, first_side)
    robot.release(first_side)
    # pat 2 -- the other hand, on the other half of the sheet
    robot.grasp(fabric_name, second_side)
    robot.release(second_side)`,
    slice: `# Smooth out the towel with alternating pats
alternating_smoothing_pats(robot, 'towel', 'left', 'right')`,
  },
  {
    id: "flip_object_over",
    source: "yam",
    task: "fold napkin into a case and place utensils in it",
    subgoal: "Turn over the spoon at the center of the board",
    definition: `def flip_object_over(robot, object_name, side, lift_delta, turn_deg=180.0):
    # lift just clear so the object can swing
    robot.servo_ee_delta(side, lift_delta)
    # roll the wrist -- this is the flip
    robot.rotate(object_name, turn_deg, side)
    # let it fall the last centimetre, landing inverted
    robot.release(side)
    # pin the flipped object down again for the next slice
    robot.grasp(object_name, side)`,
    slice: `# Lift, roll the wrist to flip the spoon, drop it, and pin it
flip_object_over(robot, 'spoon', 'left', [0.0, 0.0, 0.1])`,
  },
  {
    id: "adjust_in_place",
    source: "yam",
    task: "place bookmark into book",
    subgoal: "Adjust the bookmark in the book",
    definition: `def adjust_in_place(robot, object_name, side, nudge_delta):
    # take hold where it sits -- no lift
    robot.grasp(object_name, side)
    # slide it by a small bounded amount
    robot.servo_ee_delta(side, nudge_delta)
    # let it settle
    robot.release(side)`,
    slice: `adjust_in_place(robot, 'bookmark', 'right', [0.05, 0.0, 0.0])`,
  },
  {
    id: "open_closure",
    source: "human",
    task: "assemble photo album",
    subgoal: "Open the photo album",
    definition: `def open_closure(robot, container_name, closure_name, side, brace_side, axis, angle_deg):
    # Hold the container body down so the closure, not the container, moves.
    robot.grasp(container_name, brace_side)
    # Take the closure where it sits.
    robot.grasp(closure_name, side)
    # Swing it open about its hinge.
    robot.rotate(closure_name, axis, angle_deg, side)
    # Come off the closure; it stays open.
    robot.release(side)`,
    slice: `open_closure(robot, 'photo album', 'photo album cover', 'left', 'right', 'object_long', 180.0)`,
  },
  {
    id: "pour_into_target",
    source: "human",
    task: "serve rice into a bowl",
    subgoal: "Pour a spoonful of rice into the bowl",
    definition: `def pour_into_target(robot, vessel_name, target_name, side, axis, angle_deg):
    # Bring the held vessel's mouth over the receiving target.
    robot.goto_relative(side, target_name, 'above')
    # Tip it until it pours.
    robot.rotate(vessel_name, axis, angle_deg, side)
    # Bring it back upright; the pour ends.
    robot.rotate(vessel_name, axis, -angle_deg, side)`,
    slice: `pour_into_target(robot, 'spoon', 'bowl', 'right', 'object_long', 110.0)`,
  },
  {
    id: "stir_contents",
    source: "human",
    task: "mixing solutions with stirring rod",
    subgoal: "Stir the solution in the beaker",
    definition: `def stir_contents(robot, tool_name, vessel_name, side):
    # Bring the held tool down inside the vessel, among the contents.
    robot.goto_relative(side, vessel_name, 'inside')
    # Sweep it round the vessel; the grip never changes, nothing is let go.
    robot.rotate(tool_name, 'vertical', 360.0, side)
    robot.rotate(tool_name, 'vertical', 360.0, side)`,
    slice: `brace_and_take_tool(robot, 'beaker', 'left', 'stirring rod', 'right')
stir_contents(robot, 'stirring rod', 'beaker', 'right')`,
  },
  {
    id: "wipe_surface_back_and_forth",
    source: "human",
    task: "use lint roller on pants",
    subgoal: "Remove the lint from the pair of pants",
    definition: `def wipe_surface_back_and_forth(robot, surface_name, relation, stroke_direction, return_direction, side):
    # Park the cloth on the surface.
    robot.goto_relative(side, surface_name, relation)
    # Out and back.
    robot.move_arm(side, stroke_direction)
    robot.move_arm(side, return_direction)
    # And again.
    robot.move_arm(side, stroke_direction)
    robot.move_arm(side, return_direction)`,
    slice: `# Roll the lint roller back and forth over the pants (4 pairs of strokes)
for _ in range(2):
    wipe_surface_back_and_forth(robot, 'pants', 'against', 'right', 'left', 'left')`,
  },
  {
    id: "fold_over_and_crease",
    source: "human",
    task: "fold long pants",
    subgoal: "Fold a pair of pants",
    definition: `def fold_over_and_crease(robot, item_name, side, brace_side, direction, fold_direction):
    # Hold the item down so the fold, not the whole item, travels.
    robot.grasp(item_name, brace_side)
    # Take the free edge with the working hand.
    robot.grasp(item_name, side)
    # Carry the edge across the item ...
    robot.move_arm(side, direction)
    # ... and land it on the far side.
    robot.move_arm(side, fold_direction)
    # Let the folded edge down.
    robot.release(side)
    # Press the crease flat.
    robot.press(item_name, side)`,
    slice: `fold_over_and_crease(robot, 'pants', 'left', 'right', 'up', 'right')`,
  },
  {
    id: "wrap_around_target",
    source: "human",
    task: "use a curling iron to curl hair",
    subgoal: "Wrap a section of hair around the curling iron",
    definition: `def wrap_around_target(robot, target_name, side):
    # Start over the top of the target.
    robot.goto_relative(side, target_name, 'above')
    # Over the far side.
    robot.move_arm(side, 'away_from_body')
    # Down its far face.
    robot.move_arm(side, 'down')
    # Back underneath, toward the body.
    robot.move_arm(side, 'toward_body')
    # And up to close the circuit.
    robot.move_arm(side, 'up')`,
    slice: `# Wrap the hair around the curling iron twice.
for _ in range(2):
    wrap_around_target(robot, 'curling iron', 'left')`,
  },
];

// The frozen libraries: 23 YAM skills + 27 egocentric-human skills.
export const SKILL_LIBRARY: Record<SkillSource, [string, string][]> = {
  yam: [
    ["adjust_in_place", "Grip an object where it lies, slide it a few centimetres without lifting, and let go."],
    ["alternating_smoothing_pats", "Press the fabric flat with one arm and come off, then the other — the alternating pats of a smoothing slice."],
    ["approach_best_grasp", "Sample grasp candidates on an object, pick the best one reachable by this arm, and drive the end-effector onto it."],
    ["brace_and_pull_open", "Brace the body with one arm, take its lid, flap or handle with the other, draw it open, then release the brace."],
    ["brace_and_push_in", "Grip the same part twice, low to keep it aligned and high to push, and drive it home into its receptacle."],
    ["flip_object_over", "Lift a held flat object clear, roll the wrist a half turn, release it inverted, then grasp it again to pin it down."],
    ["fold_edge_over", "Both arms pinch a cloth edge, carry it across the item, and release — one fold."],
    ["free_hand_and_pick", "Open the idle arm, then pick the object up with the working arm."],
    ["hand_over_hand_extract", "Two grip–pull–release bites that walk a long object out of a bag, sleeve or slot."],
    ["lower_onto_target", "Hover the carried object above a detected target at the current wrist orientation and lower it in; the caller releases."],
    ["pull_part_free", "Grip a part where it sits, drag it straight off along one bounded delta, and release."],
    ["push_closure_shut", "Grip a drawer, lid, door or cover and drive it along its travel until shut, then let go."],
    ["ratchet_turn_fastener", "Two ratchet strokes on a threaded fastener; the release in between is the wrist unwinding, not a drop."],
    ["ratchet_twist_off", "Two ratchet bites on a threaded part; the sign of the angle sets whether it tightens or loosens."],
    ["relocate_object", "One-arm transport inside a single slice: pick the object up and place it at the named target."],
    ["roll_up_one_bite", "One reach-limited bite of rolling: pinch, push the roll forward, release, and travel back to the next pinch point."],
    ["run_zipper_along_seam", "Pin the case with one arm, take the zipper pull with the other, and draw it one run along the seam."],
    ["scrub_back_and_forth", "Bring an already-held cloth to a detected surface and scrub it once back and forth."],
    ["spread_taut_and_release", "With both arms already gripping, drag them apart to pull the item taut, then release both."],
    ["stir_braced_vessel", "Stir inside a braced vessel, re-seating the brace once the tool tip starts loading the wall."],
    ["tear_off_piece", "Pin the parent sheet, roll or bag with one arm, pinch the piece with the other, and pull along the tear line."],
    ["tilt_pour_over_target", "Carry a held vessel over a detected receptacle, clear the rim, tip once, and return to upright."],
    ["wrap_tension_pull", "Two hand-over-hand bites on a strand being wound: regrasp further along and pull the slack taut, twice."],
  ],
  human: [
    ["align_and_seat_braced", "One hand pins the target so it cannot shift while the other pushes the part home and lets go."],
    ["brace_and_pick", "Hold the source still with one hand and pick the object off or out of it with the other."],
    ["brace_and_take_tool", "Set up the two-handed working stance: the brace hand closes on the workpiece, the working hand on the tool."],
    ["close_closure", "Swing a closure shut with both hands on it and come off it; nothing is held afterwards."],
    ["flatten_by_pulling_taut", "Pin a slack flat item with one hand, drag it taut with the other, re-bite further along, and drag again."],
    ["flip_over_between_hands", "Turn an object face-over by passing it between the hands through a half turn."],
    ["fold_over_and_crease", "Brace a flat item, carry its free edge across in two steps, set it down, and press the crease — one fold."],
    ["hang_item_on_support", "Bring a held item over a hook, rack or branch from above and let it down onto it."],
    ["insert_into_receptacle", "Seat the held object into a receptacle, let go, and withdraw the now-empty hand."],
    ["move_item_two_handed", "Take a bulky item with both hands where it sits, carry it along a semantic direction, and release with both."],
    ["open_closure", "Swing a hinged closure open with one hand while the other braces the container body, then come off it."],
    ["pick_and_bring", "Pick an object up and carry it to a semantic relation on where it is going next; the hand keeps hold of it."],
    ["place_at_target", "Set the carried object down at a target with the working hand and free the second hand as well."],
    ["pour_into_target", "Bring a held vessel's mouth over a target, tip it until it empties, and return it upright; the grip never changes."],
    ["press_onto_target", "Press a target with both hands and come off it — seating a lid or case home, or working a control."],
    ["pull_open_and_hold", "Draw a handle, leaf or free end open along a semantic direction and keep hold of it."],
    ["pull_part_free", "Brace an assembly with one hand and pull a part off or out of it with the other."],
    ["rotate_grasped_object", "Take an object where it sits and turn it about a semantic axis; the hand ends still on the object."],
    ["scoop_and_carry", "Take a load out of a source container with a held utensil and bring it over the destination."],
    ["scrub_inside_vessel", "One hand holds the vessel still while the other puts a brush down inside it and works a stroke pair."],
    ["stir_contents", "Drop the already-held tool inside the vessel and sweep it round."],
    ["thread_through_and_pull_out", "Push a lace, cord or pin through a hole with one hand and catch the emerging end with the other to draw the slack through."],
    ["tighten_with_ratchet_regrasps", "Take up the last of a thread on an already-seated cap: turn, release the bite, re-bite, and turn again."],
    ["turn_over_object", "Flip a held object face-over and bring the new face to a semantic relation on its destination."],
    ["unscrew_cap", "Twist a threaded part, let the wrist unwind and re-close, twist again, and lift the freed part clear."],
    ["wipe_surface_back_and_forth", "Park a cloth or sponge already in one hand on an open surface and run two out-and-back strokes."],
    ["wrap_around_target", "Lead a held wrapper — ribbon, foil, film, gauze — once around a target in a closed circuit."],
  ],
};

// ---------------------------------------------------------------------------
// Failure cases (Appendix "Failure Case Analysis"). `top`/`bottom` are the row
// bounds in /figures/failure_analysis.webp (2600x2043 px).
// ---------------------------------------------------------------------------
export const FAILURE_FIG = { src: "/figures/failure_analysis.webp", w: 2600, h: 2043 };
export const FAILURE_CASES = [
  {
    mode: "Container Grasp",
    task: "Arrange Fruits",
    text: "The fruit lies at the basket rim; the left jaw lands outside the basket and the gripper closes on the basket wall.",
    top: 90,
    bottom: 415,
  },
  {
    mode: "Object Dragging",
    task: "Pack Backpack",
    text: "Pulling the zipper drags the backpack, which moves and tips over instead of staying stable.",
    top: 415,
    bottom: 742,
  },
  {
    mode: "Imprecise Alignment",
    task: "Replace Lightbulb",
    text: "The bulb reaches the socket but its base stays off-axis, so the threads never engage.",
    top: 742,
    bottom: 1069,
  },
  {
    mode: "Tool Collision",
    task: "Arrange Fruits with Tongs",
    text: "The tongs approach the pear with their tips closed and poke it instead of opening around it.",
    top: 1069,
    bottom: 1396,
  },
  {
    mode: "Slipping Off",
    task: "Deal Poker",
    text: "The left hand does not secure the card stack during the handover, and the cards slip.",
    top: 1396,
    bottom: 1723,
  },
  {
    mode: "Contact Loss",
    task: "Flip Scoreboard",
    text: "The fingertip reaches the card edge but slides off before turning it, so the score does not change.",
    top: 1723,
    bottom: 2043,
  },
];
