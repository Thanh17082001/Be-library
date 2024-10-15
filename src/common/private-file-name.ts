import {v4 as uuidv4} from 'uuid';

export const randomNameFile = (name: string) => `${uuidv4()}_${name}`;
