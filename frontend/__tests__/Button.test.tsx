import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>)
    const buttonElement = screen.getByText('Click Me')
    expect(buttonElement).toBeInTheDocument()
  })

  it('handles custom variants', () => {
    render(<Button variant="destructive">Delete</Button>)
    const buttonElement = screen.getByText('Delete')
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement.className).toContain('bg-destructive')
  })
})
