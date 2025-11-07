declare module 'chessboardjs/www/js/chessboard-1.0.0' {
  interface ChessboardConfig {
    position?: string
    orientation?: 'white' | 'black'
    draggable?: boolean
    width?: number
    pieceTheme?: string
    onPieceDrop?: (source: string, target: string) => boolean
    onSnapEnd?: () => void
    onDragStart?: (piece: string, source: string, position: string, orientation: string) => boolean
  }

  interface ChessboardInstance {
    position(fen: string): void
    position(): string
    orientation(): 'white' | 'black'
    orientation(orientation: 'white' | 'black'): void
    start(): void
    greySquare(square: string): void
    ungreySquare(square: string): void
    destroy(): void
  }

  class Chessboard {
    constructor(container: HTMLElement, config: ChessboardConfig)
  }

  export default Chessboard
}

declare global {
  interface Window {
    Chessboard: typeof import('chessboardjs/www/js/chessboard-1.0.0').default
  }
}

export {}
