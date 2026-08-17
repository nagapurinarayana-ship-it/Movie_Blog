export async function onRequest(context) {
  // Preserve the Pages response without injecting executable third-party code.
  return context.next();
}
