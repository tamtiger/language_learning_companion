import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Called when the learner chooses to leave the failed view; the boundary then re-renders children. */
  onReset: () => void
}

interface ErrorBoundaryState { failed: boolean }

/** Keeps a render error from blanking the whole app and offers a way out. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Màn hình gặp lỗi', error, info.componentStack)
  }

  private reset = () => {
    this.props.onReset()
    this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
        <h2 className="text-lg font-bold">Màn hình này gặp lỗi</h2>
        <p className="mt-2 text-sm">Tiến độ đã lưu không bị ảnh hưởng. Bản nháp chưa lưu của màn hình này có thể đã mất.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={this.reset} className="rounded-lg bg-red-200 px-4 py-2 font-bold text-zinc-950">Về trang Today</button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-red-300/60 px-4 py-2 font-bold">Tải lại</button>
        </div>
      </div>
    )
  }
}
