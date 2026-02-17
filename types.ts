
export enum ElectronicsType {
  LIGHT = 'LIGHT',
  AC = 'AC',
  TV = 'TV',
  SPEAKER = 'SPEAKER',
  FAN = 'FAN',
  PROJECTOR = 'PROJECTOR',
  PRINTER = 'PRINTER',
  CAMERA = 'CAMERA',
  ROUTER = 'ROUTER',
  CURTAIN = 'CURTAIN',
}

export enum ElectronicsState {
  ON = 'ON',
  OFF = 'OFF',
}

export interface Electronics {
  _id: string;
  electronics_id: string;
  electronics_name: string;
  electronics_key: string;
  type: ElectronicsType;
  state: ElectronicsState;
}

export interface Room {
  _id: string;
  room_id: string;
  room_name: string;
  room_key: string;
  electronics: Electronics[];
}

export type OfficeLayout = Room[];

export interface RoomElectronicsMap {
  _id: string;
  room_electronics_map_id: string;
  room_id: string;
  electronics_id: string;
}
