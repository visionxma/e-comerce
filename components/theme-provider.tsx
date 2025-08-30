'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // usa o tema do sistema por padrão
      enableSystem // permite alternar entre dark/light do sistema
      disableTransitionOnChange // remove animação estranha ao trocar de tema
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
