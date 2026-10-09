import { useId, type ComponentPropsWithRef } from 'react'

export interface GuardedButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'disabled'> {
  /** When set the button is blocked: it keeps focus, ignores activation and announces this reason. */
  disabledReason?: string
}

/**
 * A button that is blocked with aria-disabled instead of `disabled`, so it never drops keyboard
 * focus and always tells assistive technology why it cannot be used yet.
 */
export function GuardedButton({
  disabledReason,
  onClick,
  type = 'button',
  className,
  children,
  ...rest
}: GuardedButtonProps) {
  const reasonId = useId()
  const blocked = Boolean(disabledReason)
  return (
    <>
      <button
        {...rest}
        type={type}
        aria-disabled={blocked ? true : undefined}
        aria-describedby={blocked ? reasonId : rest['aria-describedby']}
        onClick={blocked ? (event) => event.preventDefault() : onClick}
        className={`${className ?? ''}${blocked ? ' cursor-not-allowed opacity-40' : ''}`.trim()}
      >
        {children}
      </button>
      {blocked && <span id={reasonId} className="sr-only">{disabledReason}</span>}
    </>
  )
}
