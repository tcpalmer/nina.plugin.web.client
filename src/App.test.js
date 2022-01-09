import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

test('check first div text', () => {
  render(<App />)
  const linkElement = screen.getByText(
    /need text to expect here/i
  )
  expect(linkElement).toBeInTheDocument()
})
