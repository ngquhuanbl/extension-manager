export function createExtensionID(name: string, publisher: string) {
  return publisher.concat("-").concat(name).replace(/ /g, "-");
}