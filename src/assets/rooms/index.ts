import roomChamber from './room_chamber.png';
import roomShrine from './room_shrine.png';
import roomMerchant from './room_merchant.png';
import roomVault from './room_vault.png';
import roomTrap from './room_trap.png';
import roomPrison from './room_prison.png';
import roomLore from './room_lore.png';
import roomLair from './room_lair.png';
import roomExit from './room_exit.png';

export const ROOM_IMAGES: Record<string, string> = {
  MONSTER: roomLair,
  TRAP: roomTrap,
  LORE: roomLore,
  WOUNDED_TRAVELER: roomPrison,
  SHRINE: roomShrine,
  MERCHANT: roomMerchant,
  TREASURE: roomVault,
  MORAL_DILEMMA: roomPrison,
  EMPTY: roomChamber,
  EXIT: roomExit,
};
