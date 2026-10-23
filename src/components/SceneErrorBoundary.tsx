'use client'

import { Component, type ReactNode } from 'react'

interface SceneErrorBoundaryProps {
  /** Shown instead of the scene when it fails, usually the scene's light-mode still. */
  fallback: ReactNode
  children: ReactNode
}

/**
 * Keeps a failing 3D scene (a model that does not download or decode, a shader that fails)
 * from taking the page down with it: R3F re-throws errors from inside the canvas into the
 * React tree above it.
 */
export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
