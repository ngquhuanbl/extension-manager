export function createExtensionID(name: string, publisher: string) {
  return publisher.concat("-").concat(name).replace(/ /g, "-");
}

export function extensionStatus2PositionComponentStatus(
  extensionStatus: ExtensionStatus
): PositionComponentStatus {
  switch (extensionStatus) {
    case 'ENABLED': return 'ACTIVE';
    case 'DISABLED': return 'INACTIVE';
  }
}
