export interface UIEvent {
  name: string;
  message: string;
}

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export type UIError = {
  message: string;
};