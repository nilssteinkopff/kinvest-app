import { forwardRef } from 'react'
import clsx from 'clsx'

const AuthLayout = forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'main'>
>(function AuthLayout({ className, ...props }, ref) {
  return (
    <main
      ref={ref}
      className={clsx(
        // Full viewport height with flex centering
        'min-h-screen w-full',
        'flex items-center justify-center',
        // Responsive padding
        'px-4 py-12 sm:px-6 lg:px-8',
        // Background styling
        'bg-white dark:bg-zinc-950',
        className
      )}
      {...props}
    />
  )
})

export { AuthLayout }