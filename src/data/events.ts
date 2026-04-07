import type { RoomEventTemplate } from '../types/room';

export const EVENT_POOL: RoomEventTemplate[] = [
  // ── LORE ───────────────────────────────────────────────────────────────
  {
    id: "LORE_MURAL",
    type: "LORE",
    title: "Ancient Mural",
    description:
      "A faded mural covers the wall. It depicts figures worshipping a massive shadowed creature. At the bottom, an inscription reads: Feed the Warden and be spared.",
    choices: [
      {
        id: "study",
        text: "Study the mural carefully",
        outcome: { description: "You piece together details about the beast. (+15 XP)", xpDelta: 15 },
      },
      {
        id: "move_on",
        text: "Move on — there is no time for this",
        outcome: { description: "You leave the mural behind. No time for riddles." },
      },
    ],
    isCombat: false,
    weight: 8,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "LORE_BONES",
    type: "LORE",
    title: "Previous Visitor",
    description:
      "A skeleton in adventurer gear sits propped against the wall. In its bony hand is a crumpled note: It hears everything. Do not run. Do not fight. Find the key.",
    choices: [
      {
        id: "search_body",
        text: "Search the body for useful items",
        outcome: {
          description: "You find a small health potion tucked in the boot.",
          itemsGained: ["POTION_HEALTH_SMALL"],
        },
      },
      {
        id: "leave_undisturbed",
        text: "Leave the dead in peace",
        outcome: { description: "You bow your head and move on. Some dignity remains down here." },
      },
    ],
    isCombat: false,
    weight: 7,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── MERCHANT ────────────────────────────────────────────────────────────
  {
    id: "MERCHANT_SHADY",
    type: "MERCHANT",
    title: "The Trader",
    description:
      "A hunched figure sits behind a makeshift stall. \"Eh? Another live one. Buy something or get out. I don't do charity.\"",
    choices: [
      {
        id: "buy_potion",
        text: "Buy a health potion (costs gold)",
        requires: { item: "GOLD" },
        outcome: {
          description: "The merchant slides a potion across the counter with a grunt.",
          itemsGained: ["POTION_HEALTH_LARGE"],
          itemsLost: ["GOLD"],
        },
      },
      {
        id: "buy_disarm",
        text: "Buy a trap disarm kit (costs gold)",
        requires: { item: "GOLD" },
        outcome: {
          description: "A small kit wrapped in cloth. \"Breaks after one use,\" the merchant warns.",
          itemsGained: ["TRAP_DISARM_KIT"],
          itemsLost: ["GOLD"],
        },
      },
      {
        id: "browse_only",
        text: "Browse but buy nothing",
        outcome: { description: "The merchant watches you with narrow eyes as you leave." },
      },
    ],
    isCombat: false,
    weight: 3,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "MERCHANT_DESPERATE",
    type: "MERCHANT",
    title: "Desperate Merchant",
    description:
      "A pale merchant blocks your path. \"Please — I will trade anything. I just need safe passage. I have been down here for days.\" They hold out a bundle of goods.",
    choices: [
      {
        id: "help_escort",
        text: "Agree to escort them to safety",
        outcome: {
          description:
            "The merchant follows you briefly before panicking and fleeing on their own. They leave their pack behind.",
          itemsGained: ["POTION_HEALTH_LARGE"],
          xpDelta: 10,
        },
      },
      {
        id: "take_goods_leave",
        text: "Take their goods and leave — you cannot afford the risk",
        outcome: {
          description:
            "You take the bundle and walk away. The merchant stares after you, hollow-eyed.",
          itemsGained: ["POTION_HEALTH_SMALL"],
        },
      },
      {
        id: "refuse",
        text: "Refuse — you cannot help them",
        outcome: { description: "You walk past. Their pleading fades behind you." },
      },
    ],
    isCombat: false,
    weight: 2,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── TRAP ────────────────────────────────────────────────────────────────
  {
    id: "TRAP_PIT",
    type: "TRAP",
    title: "Hidden Pit",
    description:
      "You hear a click underfoot a half-second too late. The floor shifts. You have a heartbeat to react.",
    choices: [
      {
        id: "disarm_kit",
        text: "Use your disarm kit to jam the mechanism",
        requires: { item: "TRAP_DISARM_KIT" },
        outcome: {
          description: "The kit jams the trigger. Close call.",
          itemsLost: ["TRAP_DISARM_KIT"],
        },
      },
      {
        id: "leap_clear",
        text: "Leap to the side",
        outcome: {
          description: "You throw yourself sideways. Not cleanly. (-8 HP)",
          hpDelta: -8,
        },
      },
      {
        id: "fall_in",
        text: "Brace for the fall",
        outcome: {
          description: "You plummet into darkness. The impact is brutal. (-18 HP)",
          hpDelta: -18,
        },
      },
    ],
    isCombat: false,
    weight: 9,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "TRAP_DART",
    type: "TRAP",
    title: "Dart Mechanism",
    description:
      "A thin wire crosses the corridor at ankle height. Beyond it, holes line the walls. Someone really did not want visitors.",
    choices: [
      {
        id: "disarm",
        text: "Carefully disarm it with your kit",
        requires: { item: "TRAP_DISARM_KIT" },
        outcome: {
          description: "Snipped. The darts stay in their holes.",
          itemsLost: ["TRAP_DISARM_KIT"],
          xpDelta: 8,
        },
      },
      {
        id: "trip_wire_skip",
        text: "Step over the wire carefully",
        outcome: {
          description: "You inch over the wire without touching it. On the far side, you exhale.",
          xpDelta: 5,
        },
      },
      {
        id: "run_through",
        text: "Sprint through before the darts can track you",
        outcome: {
          description: "Most darts miss. Most. (-12 HP)",
          hpDelta: -12,
        },
      },
    ],
    isCombat: false,
    weight: 8,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── SHRINE ──────────────────────────────────────────────────────────────
  {
    id: "SHRINE_BLOOD",
    type: "SHRINE",
    title: "Blood Shrine",
    description:
      "A stone altar stained dark. A bowl at the center still holds fresh blood. The inscription says: Give of yourself, and strength shall be returned tenfold.",
    choices: [
      {
        id: "offer_blood",
        text: "Offer your blood — costs HP, gains permanent attack",
        outcome: {
          description: "You cut your palm and let it drip. The altar glows briefly. You feel sharper. (-8 HP, +2 ATK)",
          hpDelta: -8,
          statModifier: { attack: 2 },
        },
      },
      {
        id: "refuse_shrine",
        text: "Leave the shrine undisturbed",
        outcome: { description: "You back away. Some bargains are not worth making." },
      },
    ],
    isCombat: false,
    weight: 6,
    minLevel: 2,
    maxLevel: 99,
  },
  {
    id: "SHRINE_HEALING",
    type: "SHRINE",
    title: "Mossy Shrine",
    description:
      "Green light filters through cracks in the ceiling, pooling on a worn stone basin. The water inside is clear and still.",
    choices: [
      {
        id: "drink",
        text: "Drink from the basin",
        outcome: {
          description: "The water tastes of nothing and everything. Warmth spreads through your wounds. (+20 HP)",
          hpDelta: 20,
        },
      },
      {
        id: "fill_potion",
        text: "Fill an empty vial — save it for later",
        outcome: {
          description: "You fill a vial with the glowing water. It may help when you need it most.",
          itemsGained: ["POTION_HEALTH_SMALL"],
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── WOUNDED TRAVELER ────────────────────────────────────────────────────
  {
    id: "WOUNDED_GUARD",
    type: "WOUNDED_TRAVELER",
    title: "Fallen Guard",
    description:
      "A guard in torn armor lies slumped against a pillar, breathing shallowly. \"Water...\" they rasp. Beyond saving, but still alive — for now.",
    choices: [
      {
        id: "use_potion",
        text: "Use a health potion on them",
        requires: { item: "POTION_HEALTH_SMALL" },
        outcome: {
          description:
            "The guard gasps, steadies, and unfastens their chainmail with trembling hands. \"Take it. You will need it more than me.\" (+Chainmail, +15 XP)",
          itemsGained: ["ARMOR_CHAINMAIL"],
          itemsLost: ["POTION_HEALTH_SMALL"],
          xpDelta: 15,
        },
      },
      {
        id: "talk",
        text: "Ask what they know about this place",
        outcome: {
          description:
            "\"The exit... east wing... the creature... follows sound...\" They stop breathing before finishing. (+10 XP)",
          xpDelta: 10,
        },
      },
      {
        id: "take_armor",
        text: "Take their armor",
        outcome: {
          description: "You strip the armor from their body. They watch without judgment. You do not meet their eyes.",
          itemsGained: ["ARMOR_LEATHER"],
        },
      },
    ],
    isCombat: false,
    weight: 7,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "WOUNDED_PRISONER",
    type: "WOUNDED_TRAVELER",
    title: "Chained Prisoner",
    description:
      "A figure is chained to the wall, barely conscious. Their lips are cracked. They whisper: \"They locked me here as bait... the Warden comes when I scream.\"",
    choices: [
      {
        id: "free_them",
        text: "Free them — they deserve that much",
        outcome: {
          description:
            "You break the chains. They flee without a word. In their cell, hidden under stone: a dagger. (+Dagger, +20 XP)",
          itemsGained: ["WEAPON_DAGGER"],
          xpDelta: 20,
        },
      },
      {
        id: "leave_them",
        text: "Leave — freeing them might attract the Warden",
        outcome: {
          description: "You walk away. The prisoner watches you go. Their chains clank in the silence.",
        },
      },
    ],
    isCombat: false,
    weight: 6,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── TREASURE ────────────────────────────────────────────────────────────
  {
    id: "TREASURE_GUARDED",
    type: "TREASURE",
    title: "Ornate Chest",
    description:
      "A chest sits in the center of the room, too clean, too placed. Either a trap or something is guarding it. Possibly both.",
    choices: [
      {
        id: "open_careful",
        text: "Open it carefully, checking for traps first",
        outcome: {
          description: "Your caution pays off. A weapon inside — someone hid this deliberately. (+Sword, +10 XP)",
          itemsGained: ["WEAPON_SWORD"],
          xpDelta: 10,
        },
      },
      {
        id: "open_fast",
        text: "Open it quickly and grab what is inside",
        outcome: {
          description: "A hidden needle scratches your hand as the lid flies open. The sword is worth it. (+Sword, -5 HP)",
          itemsGained: ["WEAPON_SWORD"],
          hpDelta: -5,
        },
      },
      {
        id: "ignore_chest",
        text: "Leave it — too risky",
        outcome: { description: "You leave the chest undisturbed. Some things are better left alone." },
      },
    ],
    isCombat: false,
    weight: 7,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "TREASURE_GOLD",
    type: "TREASURE",
    title: "Collapsed Treasury",
    description:
      "The ceiling has partially caved in, revealing what was once a small treasury. Coins are scattered across the rubble. The air smells of old wealth.",
    choices: [
      {
        id: "gather_coins",
        text: "Gather what coins you can",
        outcome: {
          description: "You fill your pockets with gold. Heavy, but useful if you find the trader.",
          itemsGained: ["GOLD"],
          xpDelta: 5,
        },
      },
      {
        id: "look_deeper",
        text: "Dig deeper through the rubble",
        outcome: {
          description: "Beneath a fallen beam, leather armor — protected by the debris. (-5 HP from shifting stones, +Armor)",
          itemsGained: ["ARMOR_LEATHER"],
          hpDelta: -5,
        },
      },
    ],
    isCombat: false,
    weight: 8,
    minLevel: 1,
    maxLevel: 99,
  },

  // ── MONSTER ENCOUNTERS ──────────────────────────────────────────────────
  {
    id: "MONSTER_GUARD",
    type: "MONSTER",
    title: "Dungeon Cultist",
    description:
      "A robed figure steps from the shadows, knife raised. \"Intruder. The Warden will feast well tonight.\"",
    choices: [
      {
        id: "fight_cultist",
        text: "Fight them",
        outcome: { description: "You engage the cultist.", combatTrigger: "CULTIST" },
      },
      {
        id: "try_to_flee",
        text: "Attempt to run past them",
        outcome: {
          description: "They slash at you as you push past. (-10 HP)",
          hpDelta: -10,
        },
      },
    ],
    isCombat: true,
    weight: 10,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "MONSTER_BEAST_SPAWN",
    type: "MONSTER",
    title: "Lesser Spawn",
    description:
      "A smaller, wrong-shaped creature crouches in the corner, gnawing on something. It notices you. Its head tilts. It is not the Warden — but it shares its hunger.",
    choices: [
      {
        id: "attack_spawn",
        text: "Attack before it can react",
        outcome: {
          description: "You strike first. A hard fight, but manageable.",
          combatTrigger: "SPAWN",
        },
      },
      {
        id: "back_away",
        text: "Back away slowly — do not provoke it",
        outcome: {
          description: "It watches you retreat, then returns to its meal. Your heart hammers. (+5 XP)",
          xpDelta: 5,
        },
      },
    ],
    isCombat: true,
    weight: 8,
    minLevel: 2,
    maxLevel: 99,
  },

  // ── HIGH-LEVEL / LATE GAME ──────────────────────────────────────────────
  {
    id: "SHRINE_POWER",
    type: "SHRINE",
    title: "Altar of the Warden",
    description:
      "You recognize this from the mural. A full altar, intact. A voice that is not a voice says: Kneel, and I will spare you. Fight, and you will feed me.",
    choices: [
      {
        id: "refuse_bow",
        text: "Refuse. You did not come here to kneel.",
        outcome: {
          description: "A shockwave throws you against the wall. But you do not kneel. (-15 HP, +3 ATK, +30 XP)",
          hpDelta: -15,
          statModifier: { attack: 3 },
          xpDelta: 30,
        },
      },
      {
        id: "kneel_buy_time",
        text: "Kneel — buy time to think",
        outcome: {
          description: "The presence withdraws. Your knees feel dirty. But you are unharmed. (+20 HP)",
          hpDelta: 20,
        },
      },
    ],
    isCombat: false,
    weight: 4,
    minLevel: 3,
    maxLevel: 99,
  },
  {
    id: "LORE_KEY_CLUE",
    type: "LORE",
    title: "Carved Message",
    description:
      "Someone has scratched words into the wall with a blade: The key was given freely by the one who did not deserve to live. Look among the fallen.",
    choices: [
      {
        id: "ponder",
        text: "Ponder the message",
        outcome: {
          description: "You are not sure what it means. But you feel it matters. (+10 XP)",
          xpDelta: 10,
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "TREASURE_RELIC",
    type: "TREASURE",
    title: "The Sealed Room",
    description:
      "A room with no purpose — no doors except the one you entered. At its center, on a pedestal: a carved stone relic. It does not look like it belongs here.",
    choices: [
      {
        id: "take_relic",
        text: "Take the relic",
        outcome: {
          description: "As you touch it, a deep hum moves through the stone walls. Something knows you have it. (+Relic, +25 XP)",
          itemsGained: ["RELIC"],
          xpDelta: 25,
        },
      },
      {
        id: "leave_relic",
        text: "Leave it — whatever it does, you do not want to find out",
        outcome: { description: "You back out of the room. The pedestal remains. The hum remains." },
      },
    ],
    isCombat: false,
    weight: 4,
    minLevel: 3,
    maxLevel: 99,
  },

  // ── MORAL DILEMMAS & NEW EVENTS ─────────────────────────────────────────
  {
    id: "DYING_ALCHEMIST",
    type: "WOUNDED_TRAVELER",
    title: "Dying Alchemist",
    description:
      "An old woman lies crumpled against the wall, surrounded by shattered vials. Her breathing is wet and shallow. \"My work...\" she whispers, clutching a glowing flask. \"It is finished. I just... cannot deliver it.\"",
    choices: [
      {
        id: "mercy_kill",
        text: "End her suffering quickly",
        outcome: {
          description: "You kneel beside her. It is over fast. In her pack: a potion unlike any you have seen. (+Potion of Strength, +10 XP)",
          itemsGained: ["POTION_STRENGTH"],
          xpDelta: 10,
        },
      },
      {
        id: "loot_supplies",
        text: "Take her supplies while she still breathes",
        outcome: {
          description: "She watches you rummage through her things. She does not cry. That is worse. (+Health Potion, +Gold, -5 XP)",
          itemsGained: ["POTION_HEALTH_LARGE", "GOLD"],
          xpDelta: -5,
        },
      },
      {
        id: "save_alchemist",
        text: "Use a health potion to save her",
        requires: { item: "POTION_HEALTH_SMALL" },
        outcome: {
          description: "Color returns to her face. She grips your arm: \"You are not like the others down here.\" She teaches you something about survival. (+25 XP, +2 DEF)",
          itemsLost: ["POTION_HEALTH_SMALL"],
          xpDelta: 25,
          statModifier: { defense: 2 },
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "POSSESSED_CHILD",
    type: "MORAL_DILEMMA",
    title: "Possessed Child",
    description:
      "A child sits cross-legged in the center of the room, humming a nursery rhyme. Their eyes are solid black. When they see you, they smile with too many teeth. \"Play with me,\" says a voice that is not a child's.",
    choices: [
      {
        id: "kill_child",
        text: "Kill the child before the demon takes full hold",
        outcome: {
          description: "It is over in a moment. The black fades from the child's eyes. They look confused, then still. You tell yourself it was necessary. Your hands shake. (+30 XP, -1 ATK)",
          xpDelta: 30,
          statModifier: { attack: -1 },
        },
      },
      {
        id: "exorcism",
        text: "Attempt to drive out the demon by force",
        outcome: {
          description: "You grab the child and hold on as something screams through both of you. Your bones crack. Your vision whites out. When it ends, the child is gone. A relic sits where they were. (-15 HP, +20 XP, +Relic)",
          hpDelta: -15,
          xpDelta: 20,
          itemsGained: ["RELIC"],
        },
      },
      {
        id: "flee_child",
        text: "Back away slowly and leave this room",
        outcome: {
          description: "The humming follows you down the corridor. It does not stop for a long time.",
        },
      },
    ],
    isCombat: false,
    weight: 4,
    minLevel: 2,
    maxLevel: 99,
  },
  {
    id: "PRISONER_DILEMMA",
    type: "MORAL_DILEMMA",
    title: "The Two Prisoners",
    description:
      "Two cells. One holds a scarred warrior, the other a trembling healer. You find a single key in the wall. \"Free me,\" they both say. \"The other one is not worth saving.\"",
    choices: [
      {
        id: "free_warrior",
        text: "Free the warrior",
        outcome: {
          description: "The warrior nods once, presses a blade into your hand, and vanishes into the dark. The healer weeps. (+Iron Sword, +10 XP)",
          itemsGained: ["WEAPON_SWORD"],
          xpDelta: 10,
        },
      },
      {
        id: "free_healer",
        text: "Free the healer",
        outcome: {
          description: "The healer blesses you and leaves behind their supplies. The warrior curses you with a voice like grinding stone. (+Health Potion, +Potion of Strength, +10 XP)",
          itemsGained: ["POTION_HEALTH_LARGE", "POTION_STRENGTH"],
          xpDelta: 10,
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "BLOOD_FONT",
    type: "SHRINE",
    title: "Blood Font",
    description:
      "A basin carved from obsidian, filled with blood that does not clot. The air tastes of iron and ozone. Words are etched around the rim: STRENGTH THROUGH SACRIFICE.",
    choices: [
      {
        id: "sacrifice_hp",
        text: "Plunge your hand in — sacrifice HP for raw power",
        outcome: {
          description: "Pain whites out your vision. When it clears, every muscle in your body feels like coiled wire. (-10 HP, +3 ATK)",
          hpDelta: -10,
          statModifier: { attack: 3 },
        },
      },
      {
        id: "sacrifice_maxhp",
        text: "Drink from the basin — sacrifice vitality for resilience",
        outcome: {
          description: "The blood tastes like nothing and everything. Something fundamental changes inside you. You feel... harder. (-10 Max HP, +3 DEF)",
          statModifier: { maxHp: -10, defense: 3 },
        },
      },
      {
        id: "leave_font",
        text: "Walk away — some bargains are not worth making",
        outcome: {
          description: "You leave. The blood in the basin does not ripple.",
        },
      },
    ],
    isCombat: false,
    weight: 4,
    minLevel: 2,
    maxLevel: 99,
  },
  {
    id: "CANNIBAL_CAMP",
    type: "MORAL_DILEMMA",
    title: "Cannibal Camp",
    description:
      "The smell hits you first — roasting meat. Three gaunt figures sit around a fire pit, eating. One of them looks up and grins. \"Hungry, stranger? There is plenty. Sit.\" The bones in the fire are not animal bones.",
    choices: [
      {
        id: "join_feast",
        text: "Sit and eat — you need the strength",
        outcome: {
          description: "You do not ask what the meat is. You eat. They laugh. You heal. Something in you dies a little. (+25 HP, -10 XP)",
          hpDelta: 25,
          xpDelta: -10,
        },
      },
      {
        id: "fight_cannibals",
        text: "Attack them — this ends now",
        outcome: {
          description: "You kick the fire into their laps. They scramble for weapons.",
          combatTrigger: "CANNIBALS",
        },
      },
      {
        id: "sneak_past",
        text: "Sneak past while they are distracted",
        outcome: {
          description: "You hold your breath and move through the shadows. They do not notice. Or maybe they let you go. (+5 XP)",
          xpDelta: 5,
        },
      },
    ],
    isCombat: true,
    weight: 4,
    minLevel: 2,
    maxLevel: 99,
  },
  {
    id: "CURSED_ALTAR",
    type: "TREASURE",
    title: "Cursed Weapon Altar",
    description:
      "A blade floats above a stone altar, spinning slowly. It is beautiful — dark metal with veins of red that pulse like a heartbeat. Whispers fill the room. The blade wants to be held.",
    choices: [
      {
        id: "take_blade",
        text: "Take the cursed blade",
        outcome: {
          description: "The moment your fingers close around the hilt, the whispers stop. Then they resume — inside your head. The blade is magnificent. And hungry. (+Cursed Blade, +15 XP)",
          itemsGained: ["WEAPON_CURSED_BLADE"],
          xpDelta: 15,
        },
      },
      {
        id: "leave_blade",
        text: "Leave it — nothing good comes free",
        outcome: {
          description: "You back away. The whispers turn angry, then fade. The blade continues to spin, waiting for the next fool. (+5 XP)",
          xpDelta: 5,
        },
      },
    ],
    isCombat: false,
    weight: 3,
    minLevel: 3,
    maxLevel: 99,
  },
  {
    id: "SLAVE_TRADER",
    type: "MORAL_DILEMMA",
    title: "Slave Trader",
    description:
      "A heavy man in expensive furs sits in a makeshift throne, flanked by chained figures with hollow eyes. \"Looking to buy? Or sell?\" He laughs at his own joke. \"Gold buys freedom. Or you could try to take it.\"",
    choices: [
      {
        id: "buy_freedom",
        text: "Pay gold to free the prisoners",
        requires: { item: "GOLD" },
        outcome: {
          description: "He bites the coin, nods, and unlocks the chains. The freed prisoners press something into your hand before vanishing. (+25 XP, +Potion of Iron Skin)",
          itemsLost: ["GOLD"],
          itemsGained: ["POTION_IRON_SKIN"],
          xpDelta: 25,
        },
      },
      {
        id: "fight_trader",
        text: "Draw your weapon — this man does not deserve to breathe",
        outcome: {
          description: "The trader is faster than he looks. He draws a curved blade from behind his throne.",
          combatTrigger: "SLAVE_TRADER",
        },
      },
      {
        id: "walk_away_trader",
        text: "Walk away — this is not your fight",
        outcome: {
          description: "You leave. The chains clank behind you. You try not to think about it.",
        },
      },
    ],
    isCombat: true,
    weight: 4,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "PLAGUE_VICTIM",
    type: "WOUNDED_TRAVELER",
    title: "Plague Victim",
    description:
      "A figure lies on a cot, skin mottled with black veins. They are still breathing — barely. Their belongings are scattered nearby. \"Don't... touch me...\" they wheeze. \"It spreads.\"",
    choices: [
      {
        id: "help_plague",
        text: "Help them anyway — risk the infection",
        outcome: {
          description: "You dress their wounds with torn cloth. Something stings your skin where their blood touches. They press gold into your hand. \"Thank you.\" (-8 HP, +20 XP, +Gold)",
          hpDelta: -8,
          xpDelta: 20,
          itemsGained: ["GOLD"],
        },
      },
      {
        id: "mercy_kill_plague",
        text: "End their suffering and take what is useful",
        outcome: {
          description: "You are quick about it. Their armor is still intact. A potion rolls from their pack. You do not look at their face. (+Leather Armor, +Small Health Potion)",
          itemsGained: ["ARMOR_LEATHER", "POTION_HEALTH_SMALL"],
        },
      },
      {
        id: "leave_plague",
        text: "Leave — you cannot risk it",
        outcome: {
          description: "You step around them carefully. As you leave, you notice a black vein on your own wrist. The dungeon does not let you walk away clean.",
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "DESPERATE_MOTHER",
    type: "MORAL_DILEMMA",
    title: "Desperate Mother",
    description:
      "A woman blocks the corridor, wild-eyed and trembling. Behind her, a small alcove where a child sleeps fitfully. \"Give me your weapon,\" she hisses. \"I need to protect my child. Give it to me or I will take it.\"",
    choices: [
      {
        id: "give_weapon",
        text: "Give her your equipped weapon",
        requires: { item: "WEAPON_DAGGER" },
        outcome: {
          description: "She snatches the blade and holds it like someone who knows how to use it. \"Thank you. Now go. Quickly.\" Something about her conviction makes you feel stronger. (+30 XP, +2 DEF)",
          itemsLost: ["WEAPON_DAGGER"],
          xpDelta: 30,
          statModifier: { defense: 2 },
        },
      },
      {
        id: "give_gold",
        text: "Offer gold instead",
        requires: { item: "GOLD" },
        outcome: {
          description: "She takes the gold reluctantly. \"This will not stop the things down here.\" But her eyes soften. \"Go. Be safe.\" (+15 XP)",
          itemsLost: ["GOLD"],
          xpDelta: 15,
        },
      },
      {
        id: "refuse_mother",
        text: "Refuse — you need everything you have",
        outcome: {
          description: "Her eyes harden. \"Then you are just like the rest of them.\" She lunges.",
          combatTrigger: "DESPERATE_MOTHER",
        },
      },
    ],
    isCombat: true,
    weight: 4,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "THE_RITUAL",
    type: "MORAL_DILEMMA",
    title: "The Ritual",
    description:
      "Hooded figures kneel in a circle, chanting in a language you do not recognize. At the center, a pulsing orb of dark energy crackles with power. One of them turns: \"Join us. The power we offer is real. The price... manageable.\"",
    choices: [
      {
        id: "join_ritual",
        text: "Join the ritual — take the power",
        outcome: {
          description: "You kneel. The energy pours into you like liquid fire. Your muscles swell. Your vision darkens at the edges. Something is wrong. But you are strong. So strong. (-20 HP, +4 ATK, poisoned)",
          hpDelta: -20,
          statModifier: { attack: 4 },
          buffGained: { type: 'POISON', value: 2, turnsRemaining: 5 },
        },
      },
      {
        id: "disrupt_ritual",
        text: "Disrupt the ritual — destroy the orb",
        outcome: {
          description: "You kick the orb. It shatters. The hooded figures scream. One of them draws a blade. (+20 XP)",
          xpDelta: 20,
          combatTrigger: "RITUALIST",
        },
      },
      {
        id: "observe_ritual",
        text: "Watch silently from the shadows",
        outcome: {
          description: "You observe the ritual to completion. The orb dissolves. The figures collapse, spent. Among the debris, a scroll. (+15 XP, +Scroll of Identify)",
          xpDelta: 15,
          itemsGained: ["SCROLL_IDENTIFY"],
        },
      },
    ],
    isCombat: true,
    weight: 3,
    minLevel: 3,
    maxLevel: 99,
  },
  {
    id: "INFECTED_SOLDIER",
    type: "WOUNDED_TRAVELER",
    title: "Infected Soldier",
    description:
      "A soldier in ruined armor writhes on the ground, black tendrils creeping across their skin. \"Kill me,\" they beg, then their voice drops an octave: \"Don't.\" The infection is speaking through them.",
    choices: [
      {
        id: "use_antidote_soldier",
        text: "Use your antidote on them",
        requires: { item: "POTION_ANTIDOTE" },
        outcome: {
          description: "You pour the antidote into their mouth. The black tendrils recede. They gasp, rip off their chainmail, and press it into your arms. \"Take it. I will not need armor where I am going.\" (+20 XP, +Chainmail)",
          itemsLost: ["POTION_ANTIDOTE"],
          xpDelta: 20,
          itemsGained: ["ARMOR_CHAINMAIL"],
        },
      },
      {
        id: "put_down_soldier",
        text: "Put them down — take their weapon",
        outcome: {
          description: "The soldier's eyes clear for one moment of gratitude before the end. Their war axe is well-maintained. (+War Axe, +10 XP)",
          itemsGained: ["WEAPON_AXE"],
          xpDelta: 10,
        },
      },
      {
        id: "leave_soldier",
        text: "Leave — you do not want any part of this",
        outcome: {
          description: "As you turn to leave, something wet touches your ankle. The tendrils. They are fast. You pull free but the damage is done. (Poisoned: -2 HP/turn, 5 turns)",
          buffGained: { type: 'POISON', value: 2, turnsRemaining: 5 },
        },
      },
    ],
    isCombat: false,
    weight: 5,
    minLevel: 1,
    maxLevel: 99,
  },
  {
    id: "TRAITORS_OFFER",
    type: "MORAL_DILEMMA",
    title: "The Traitor's Offer",
    description:
      "A well-dressed man leans against the wall, arms crossed, smiling. \"I know where the Warden is. I know where the key is. I know the way out.\" He pauses. \"I can give you supplies. All I ask is that you make a little noise on your way out — draw the beast away from me.\"",
    choices: [
      {
        id: "accept_deal",
        text: "Accept the deal — take the supplies",
        outcome: {
          description: "He hands you a pack full of useful things. \"Remember: make noise.\" You know the beast will come. You took the deal anyway. (+Sword, +Gold, +Health Potion)",
          itemsGained: ["WEAPON_SWORD", "GOLD", "POTION_HEALTH_LARGE"],
        },
      },
      {
        id: "refuse_deal",
        text: "Refuse — you will not be someone's bait",
        outcome: {
          description: "His smile fades. \"Your loss.\" He melts into the darkness. You feel better about yourself, at least. (+20 XP, +1 ATK)",
          xpDelta: 20,
          statModifier: { attack: 1 },
        },
      },
      {
        id: "kill_traitor",
        text: "Kill him and take his things",
        outcome: {
          description: "His smile vanishes. \"Ungrateful wretch.\" He draws a hidden blade.",
          combatTrigger: "TRAITOR",
        },
      },
    ],
    isCombat: true,
    weight: 3,
    minLevel: 2,
    maxLevel: 99,
  },
];

// Enemy stat templates for combat encounters triggered by events
import type { EnemyBehavior } from '../types/game';

export interface EnemyTemplate {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  lootTable: Array<{ itemType: string; chance: number }>;
  canFlee: boolean;
  behavior: EnemyBehavior;
}

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  CULTIST: {
    id: "CULTIST",
    name: "Dungeon Cultist",
    hp: 18,
    maxHp: 18,
    attack: 7,
    defense: 2,
    xpReward: 20,
    lootTable: [
      { itemType: "GOLD", chance: 0.7 },
      { itemType: "POTION_HEALTH_SMALL", chance: 0.3 },
    ],
    canFlee: true,
    behavior: 'basic',
  },
  SPAWN: {
    id: "SPAWN",
    name: "Warden Spawn",
    hp: 28,
    maxHp: 28,
    attack: 10,
    defense: 4,
    xpReward: 35,
    lootTable: [
      { itemType: "POTION_HEALTH_SMALL", chance: 0.4 },
      { itemType: "WEAPON_DAGGER", chance: 0.2 },
    ],
    canFlee: false,
    behavior: 'brute',
  },
  CANNIBALS: {
    id: "CANNIBALS",
    name: "Cannibal Pack",
    hp: 30,
    maxHp: 30,
    attack: 9,
    defense: 3,
    xpReward: 30,
    lootTable: [
      { itemType: "GOLD", chance: 0.6 },
      { itemType: "POTION_HEALTH_SMALL", chance: 0.4 },
    ],
    canFlee: true,
    behavior: 'brute',
  },
  SLAVE_TRADER: {
    id: "SLAVE_TRADER",
    name: "Slave Trader",
    hp: 22,
    maxHp: 22,
    attack: 11,
    defense: 3,
    xpReward: 25,
    lootTable: [
      { itemType: "GOLD", chance: 0.8 },
      { itemType: "WEAPON_DAGGER", chance: 0.3 },
    ],
    canFlee: true,
    behavior: 'quick',
  },
  DESPERATE_MOTHER: {
    id: "DESPERATE_MOTHER",
    name: "Desperate Mother",
    hp: 15,
    maxHp: 15,
    attack: 6,
    defense: 1,
    xpReward: 10,
    lootTable: [],
    canFlee: true,
    behavior: 'quick',
  },
  RITUALIST: {
    id: "RITUALIST",
    name: "Ritualist",
    hp: 35,
    maxHp: 35,
    attack: 12,
    defense: 5,
    xpReward: 40,
    lootTable: [
      { itemType: "RELIC", chance: 0.5 },
      { itemType: "POTION_HEALTH_LARGE", chance: 0.4 },
    ],
    canFlee: true,
    behavior: 'brute',
  },
  TRAITOR: {
    id: "TRAITOR",
    name: "The Traitor",
    hp: 20,
    maxHp: 20,
    attack: 8,
    defense: 4,
    xpReward: 20,
    lootTable: [
      { itemType: "WEAPON_SWORD", chance: 0.5 },
      { itemType: "GOLD", chance: 0.8 },
    ],
    canFlee: true,
    behavior: 'basic',
  },
};
