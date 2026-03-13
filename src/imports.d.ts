// import glsl as string.
declare module "*.glsl" {
  const value: string;
  export default value;
}

// import text files as strings.
declare module "*.txt" {
  const value: string;
  export default value;
}