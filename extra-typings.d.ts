// I don't depend on the d3 typings because as of this writing they don't have the proper typings for all
// of these libraries and I'm not going to go rewrite them all now.
declare module 'd3-scale' {
  var scale: any;
  export = scale;
}

declare module 'react-is-deprecated' {
  import { Validator } from 'react';
  export function deprecate<T>(validator: Validator<T>, message: string): Validator<T>;
}
