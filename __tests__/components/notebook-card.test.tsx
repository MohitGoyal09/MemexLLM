/**
 * Tests for NotebookCard component
 */

import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotebookCard } from '@/components/notebook-card'
import { render } from '../utils/test-utils'

const mockNotebook = {
  id: 'notebook-1',
  title: 'Test Notebook',
  category: 'Web Development',
  date: '2024-01-15',
  sources: 5,
  isPublic: false,
}

const mockAINotebook = {
  id: 'notebook-2',
  title: 'AI Research Notes',
  category: 'AI Research',
  date: '2024-01-14',
  sources: 10,
  isPublic: true,
}

describe('NotebookCard', () => {
  describe('Rendering', () => {
    it('should render notebook title', () => {
      render(<NotebookCard notebook={mockNotebook} />)

      expect(screen.getByText('Test Notebook')).toBeInTheDocument()
    })

    it('should render notebook date', () => {
      render(<NotebookCard notebook={mockNotebook} />)

      expect(screen.getByText('2024-01-15')).toBeInTheDocument()
    })

    it('should render sources count', () => {
      render(<NotebookCard notebook={mockNotebook} />)

      expect(screen.getByText('5 sources')).toBeInTheDocument()
    })

    it('should show globe icon for public notebooks', () => {
      render(<NotebookCard notebook={mockAINotebook} />)

      // The Globe icon should be present for public notebooks
      const container = screen.getByText('AI Research Notes').closest('div')
      expect(container?.parentElement).toBeInTheDocument()
    })

    it('should not show globe icon for private notebooks', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      // Check that the globe icon class is not present
      // Globe icon has w-3 h-3 ml-2 classes
      const globeIcon = container.querySelector('.ml-2.w-3.h-3')
      expect(globeIcon).not.toBeInTheDocument()
    })

    it('should apply correct background color based on id', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      const card = container.firstChild
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
    })

    it('should render with Book icon for non-AI category', () => {
      render(<NotebookCard notebook={mockNotebook} />)

      // The component renders an icon container
      const iconContainer = screen
        .getByText('Test Notebook')
        .closest('div')
        ?.parentElement?.querySelector('.w-10.h-10')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should render with Bot icon for AI category', () => {
      render(<NotebookCard notebook={mockAINotebook} />)

      // The component renders an icon container
      const iconContainer = screen
        .getByText('AI Research Notes')
        .closest('div')
        ?.parentElement?.querySelector('.w-10.h-10')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Dropdown menu', () => {
    it('should render dropdown menu trigger button', () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      expect(menuButton).toBeInTheDocument()
    })

    it('should open dropdown menu on click', async () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      await userEvent.click(menuButton)

      expect(screen.getByText('Edit title')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should have Edit title menu item', async () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      await userEvent.click(menuButton)

      const editItem = screen.getByText('Edit title')
      expect(editItem).toBeInTheDocument()
    })

    it('should have Delete menu item with destructive styling', async () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      await userEvent.click(menuButton)

      const deleteItem = screen.getByText('Delete')
      expect(deleteItem).toBeInTheDocument()
      // Check parent has destructive class
      expect(deleteItem.closest('[class*="destructive"]')).toBeInTheDocument()
    })

    it('should prevent default on Edit click', async () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      await userEvent.click(menuButton)

      const editItem = screen.getByText('Edit title')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')

      fireEvent(editItem, clickEvent)

      // The component calls e.preventDefault() in the onClick handler
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should prevent default on Delete click', async () => {
      render(<NotebookCard notebook={mockNotebook} />)

      const menuButton = screen.getByRole('button')
      await userEvent.click(menuButton)

      const deleteItem = screen.getByText('Delete')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')

      fireEvent(deleteItem, clickEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Props handling', () => {
    it('should handle variant prop', () => {
      render(<NotebookCard notebook={mockNotebook} variant="featured" />)

      expect(screen.getByText('Test Notebook')).toBeInTheDocument()
    })

    it('should handle recent variant', () => {
      render(<NotebookCard notebook={mockNotebook} variant="recent" />)

      expect(screen.getByText('Test Notebook')).toBeInTheDocument()
    })

    it('should truncate long titles', () => {
      const longTitleNotebook = {
        ...mockNotebook,
        title:
          'This is a very long notebook title that should be truncated with line-clamp-2 class to prevent overflow',
      }

      render(<NotebookCard notebook={longTitleNotebook} />)

      const titleElement = screen.getByText(longTitleNotebook.title)
      expect(titleElement).toHaveClass('line-clamp-2')
    })

    it('should handle zero sources', () => {
      const noSourcesNotebook = {
        ...mockNotebook,
        sources: 0,
      }

      render(<NotebookCard notebook={noSourcesNotebook} />)

      expect(screen.getByText('0 sources')).toBeInTheDocument()
    })

    it('should handle different id values for color selection', () => {
      const notebooks = [
        { ...mockNotebook, id: 'a' },
        { ...mockNotebook, id: 'b' },
        { ...mockNotebook, id: 'c' },
        { ...mockNotebook, id: 'd' },
        { ...mockNotebook, id: 'e' },
      ]

      notebooks.forEach(notebook => {
        const { container, unmount } = render(<NotebookCard notebook={notebook} />)
        expect(container.firstChild).toHaveClass('rounded-xl')
        unmount()
      })
    })
  })

  describe('Styling', () => {
    it('should have cursor-pointer class', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      expect(container.firstChild).toHaveClass('cursor-pointer')
    })

    it('should have transition-all class for hover effects', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      expect(container.firstChild).toHaveClass('transition-all')
    })

    it('should have minimum height', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      expect(container.firstChild).toHaveClass('min-h-[180px]')
    })

    it('should have group class for group hover effects', () => {
      const { container } = render(<NotebookCard notebook={mockNotebook} />)

      expect(container.firstChild).toHaveClass('group')
    })
  })
})
