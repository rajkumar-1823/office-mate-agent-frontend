
import { Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';

export const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'controlDevice',
    description: 'Sets the state of one or more electronic devices (e.g., light, AC) to ON or OFF.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deviceIds: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'An array of unique identifiers for the devices to control.',
        },
        state: {
          type: Type.STRING,
          description: 'The target state for the devices, must be either "ON" or "OFF".',
          enum: ['ON', 'OFF'],
        },
      },
      required: ['deviceIds', 'state'],
    },
  },
  {
    name: 'createRoom',
    description: 'Creates a new room in the office. Use when the user asks to add or create a room.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        roomName: {
          type: Type.STRING,
          description: 'The name of the room to create, e.g. "Conference Room", "MD Room 1".',
        },
      },
      required: ['roomName'],
    },
  },
  {
    name: 'createElectronics',
    description: 'Creates a new electronic device in the office. Use when the user asks to add a light, AC, TV, or speaker.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        electronicsName: {
          type: Type.STRING,
          description: 'The name of the electronic device, e.g. "Tube Light 1", "Split AC".',
        },
        type: {
          type: Type.STRING,
          description: 'The type of electronic device.',
          enum: ['LIGHT', 'AC', 'TV', 'SPEAKER', 'FAN', 'PROJECTOR', 'PRINTER', 'CAMERA', 'ROUTER', 'CURTAIN'],
        },
      },
      required: ['electronicsName', 'type'],
    },
  },
  {
    name: 'mapElectronicsToRoom',
    description: 'Maps an existing electronic device to a room. Use when the user says to assign, connect, or put a device in a room.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        roomName: {
          type: Type.STRING,
          description: 'The name of the room to map the device to.',
        },
        electronicsName: {
          type: Type.STRING,
          description: 'The name of the electronic device to map.',
        },
      },
      required: ['roomName', 'electronicsName'],
    },
  },
];
