"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  const handleChange = React.useCallback((value: string) => {
    console.log("InputOTP handleChange called with:", value)
    if (props.onChange) {
      props.onChange(value)
    }
  }, [props.onChange])

  const handleComplete = React.useCallback((value: string) => {
    console.log("InputOTP handleComplete called with:", value)
    if (props.onComplete) {
      props.onComplete(value)
    }
  }, [props.onComplete])

  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
      disabled={props.disabled || false}
      onChange={handleChange}
      onComplete={handleComplete}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  
  // Add comprehensive null checking to prevent "Cannot read properties of undefined (reading '0')" error
  const slotData = inputOTPContext?.slots?.[index] ?? {}
  const { char, hasFakeCaret, isActive } = slotData

  const handleClick = React.useCallback(() => {
    console.log(`InputOTPSlot ${index} clicked`, { inputOTPContext, slotData })
    // Ensure the slot is clickable and focuses the input
    if (inputOTPContext && typeof (inputOTPContext as any).focus === 'function') {
      try {
        (inputOTPContext as any).focus(index)
      } catch (error) {
        console.error(`Error focusing slot ${index}:`, error)
      }
    }
  }, [index, inputOTPContext])

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px] cursor-pointer hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
      onClick={handleClick}
      onKeyDown={(e) => {
        console.log(`InputOTPSlot ${index} keydown:`, e.key)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`OTP digit ${index + 1}`}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
