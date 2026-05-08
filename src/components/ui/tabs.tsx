"use client";

import { createContext, useCallback, useContext, useId, useState, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
  baseId: "",
});

function useTabsContext() {
  return useContext(TabsContext);
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type TabsProps = HTMLAttributes<HTMLDivElement> & {
  /** Controlled value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Uncontrolled default value */
  defaultValue?: string;
};

function Tabs({ value: controlledValue, onValueChange, defaultValue = "", className, children, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const baseId = useId();

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, baseId }}>
      <div className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// TabsList — horizontal tab bar
// ---------------------------------------------------------------------------

function TabsList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist" className={cn("flex items-center gap-1 border-b border-border", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TabsTrigger — individual tab button
// ---------------------------------------------------------------------------

type TabsTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  value: string;
  disabled?: boolean;
};

function TabsTrigger({ value, disabled = false, className, children, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, baseId } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {/* Active underline indicator */}
      {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabsContent — panel for each tab
// ---------------------------------------------------------------------------

type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: selectedValue, baseId } = useTabsContext();
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      tabIndex={0}
      className={cn("animate-fade-in focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
