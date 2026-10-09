/** True when a control cannot be activated: natively disabled or blocked with aria-disabled. */
export function isBlocked(element: HTMLElement): boolean {
  return (element as HTMLButtonElement).disabled === true || element.getAttribute('aria-disabled') === 'true'
}
