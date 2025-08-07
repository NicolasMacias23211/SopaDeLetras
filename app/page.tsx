"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'

// Datos de ejemplo
const EXAMPLE_MATRIX = `N, D, E, K, I, C, A, N, G, U, R, O, G, E
S, X, R, Y, K, V, I, I, Q, G, W, Q, O, D
J, A, G, U, A, R, Z, W, B, N, K, O, U, A
M, L, E, L, E, F, A, N, T, E, H, O, G, W
L, O, B, O, N, U, T, R, I, A, O, U, S, U
W, W, O, S, O, G, A, T, O, V, R, T, M, O
H, L, Z, N, C, T, Y, Z, E, O, X, A, U, R
C, E, C, Y, T, I, B, U, R, O, N, S, R, O
C, O, N, E, J, O, Y, U, S, M, R, S, H, T
Y, N, I, F, E, F, P, T, E, Z, O, O, S, F
O, S, S, E, R, P, I, E, N, T, E, F, L, G
P, P, V, D, D, X, U, F, A, L, C, O, N, Y
M, O, N, O, C, U, Q, W, M, A, N, A, T, I
N, N, X, H, E, B, P, M, U, P, E, R, R, O`

const EXAMPLE_WORDS = "MANATI LEON PERRO LORO GATO TORO CONEJO ORUGA TIBURON ELEFANTE ALCON SERPIENTE JAGUAR CANGURO LOBO MONO NUTRIA"

interface Position {
  row: number
  col: number
}

interface FoundWord {
  word: string
  positions: Position[]
  direction: string
}

export default function WordSearchGame() {
  const [matrix, setMatrix] = useState<string[][]>([])
  const [words, setWords] = useState<string[]>([])
  const [foundWords, setFoundWords] = useState<FoundWord[]>([])
  const [highlightedPositions, setHighlightedPositions] = useState<Set<string>>(new Set())
  const [matrixInput, setMatrixInput] = useState(EXAMPLE_MATRIX)
  const [wordsInput, setWordsInput] = useState(EXAMPLE_WORDS)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  // Direcciones de búsqueda: [fila, columna]
  const directions = [
    [0, 1],   // Horizontal derecha
    [0, -1],  // Horizontal izquierda
    [1, 0],   // Vertical abajo
    [-1, 0],  // Vertical arriba
    [1, 1],   // Diagonal abajo-derecha
    [-1, -1], // Diagonal arriba-izquierda
    [1, -1],  // Diagonal abajo-izquierda
    [-1, 1]   // Diagonal arriba-derecha
  ]

  const directionNames = [
    "Horizontal →",
    "Horizontal ←",
    "Vertical ↓",
    "Vertical ↑",
    "Diagonal ↘",
    "Diagonal ↖",
    "Diagonal ↙",
    "Diagonal ↗"
  ]

  // Función para buscar una palabra en una dirección específica
  const searchWordInDirection = (
    matrix: string[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: number[]
  ): Position[] | null => {
    const positions: Position[] = []
    const [dRow, dCol] = direction
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow
      const col = startCol + i * dCol
      
      if (row < 0 || row >= matrix.length || col < 0 || col >= matrix[0].length) {
        return null
      }
      
      if (matrix[row][col] !== word[i]) {
        return null
      }
      
      positions.push({ row, col })
    }
    
    return positions
  }

  // Función para buscar todas las palabras en la matriz
  const findAllWords = (matrix: string[][], words: string[]): FoundWord[] => {
    const found: FoundWord[] = []
    
    words.forEach(word => {
      const upperWord = word.toUpperCase()
      let wordFound = false
      
      for (let row = 0; row < matrix.length && !wordFound; row++) {
        for (let col = 0; col < matrix[0].length && !wordFound; col++) {
          directions.forEach((direction, dirIndex) => {
            if (!wordFound) {
              const positions = searchWordInDirection(matrix, upperWord, row, col, direction)
              if (positions) {
                found.push({
                  word: upperWord,
                  positions,
                  direction: directionNames[dirIndex]
                })
                wordFound = true
              }
            }
          })
        }
      }
    })
    
    return found
  }

  // Procesar la entrada de la matriz
  const processMatrix = (input: string): string[][] => {
    const rows = input.trim().split('\n')
    return rows.map(row => 
      row.split(',').map(cell => cell.trim().toUpperCase())
    )
  }

  // Procesar la entrada de palabras
  const processWords = (input: string): string[] => {
    return input.trim().split(/\s+/).filter(word => word.length > 0)
  }

  // Inicializar con datos de ejemplo
  useEffect(() => {
    const processedMatrix = processMatrix(matrixInput)
    const processedWords = processWords(wordsInput)
    
    setMatrix(processedMatrix)
    setWords(processedWords)
    
    const found = findAllWords(processedMatrix, processedWords)
    setFoundWords(found)
  }, [])

  // Función para procesar nuevas entradas
  const handleSearch = () => {
    try {
      const processedMatrix = processMatrix(matrixInput)
      const processedWords = processWords(wordsInput)
      
      if (processedMatrix.length !== 14 || processedMatrix[0].length !== 14) {
        alert('La matriz debe ser de 14x14')
        return
      }
      
      setMatrix(processedMatrix)
      setWords(processedWords)
      
      const found = findAllWords(processedMatrix, processedWords)
      setFoundWords(found)
      setSelectedWord(null)
      setHighlightedPositions(new Set())
    } catch (error) {
      alert('Error al procesar los datos. Verifica el formato.')
    }
  }

  // Función para resaltar una palabra
  const highlightWord = (word: string) => {
    const foundWord = foundWords.find(fw => fw.word === word)
    if (foundWord) {
      const positionStrings = foundWord.positions.map(pos => `${pos.row}-${pos.col}`)
      setHighlightedPositions(new Set(positionStrings))
      setSelectedWord(word)
    } else {
      setHighlightedPositions(new Set())
      setSelectedWord(word)
    }
  }

  // Función para limpiar resaltado
  const clearHighlight = () => {
    setHighlightedPositions(new Set())
    setSelectedWord(null)
  }

  // Obtener palabras encontradas y no encontradas
  const foundWordsList = foundWords.map(fw => fw.word)
  const notFoundWords = words.filter(word => !foundWordsList.includes(word.toUpperCase()))

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sopa de Letras</h1>
        <p className="text-center text-muted-foreground">
          Encuentra todas las palabras ocultas en la matriz de 14×14
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Panel de entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Ingresa la matriz de caracteres y las palabras a buscar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="matrix">Matriz (14×14, separada por comas)</Label>
              <Textarea
                id="matrix"
                value={matrixInput}
                onChange={(e) => setMatrixInput(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="N, D, E, K, I, C, A, N, G, U, R, O, G, E..."
              />
            </div>
            <div>
              <Label htmlFor="words">Palabras (separadas por espacios)</Label>
              <Input
                id="words"
                value={wordsInput}
                onChange={(e) => setWordsInput(e.target.value)}
                placeholder="MANATI LEON PERRO LORO..."
              />
            </div>
            <Button onClick={handleSearch} className="w-full">
              Buscar Palabras
            </Button>
          </CardContent>
        </Card>

        {/* Panel de resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultados
              <Button variant="outline" size="sm" onClick={clearHighlight}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </CardTitle>
            <CardDescription>
              {foundWords.length} de {words.length} palabras encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Palabras encontradas */}
              <div>
                <h3 className="font-semibold text-green-600 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Encontradas ({foundWords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {foundWords.map((fw, index) => (
                    <Badge
                      key={index}
                      variant={selectedWord === fw.word ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-green-100"
                      onClick={() => highlightWord(fw.word)}
                      title={`Dirección: ${fw.direction}`}
                    >
                      {fw.word}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Palabras no encontradas */}
              {notFoundWords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 mb-2 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    No encontradas ({notFoundWords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {notFoundWords.map((word, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => highlightWord(word.toUpperCase())}
                      >
                        {word.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matriz de sopa de letras */}
      <Card>
        <CardHeader>
          <CardTitle>Sopa de Letras</CardTitle>
          <CardDescription>
            Haz clic en las palabras de la lista para resaltarlas en la matriz
            {selectedWord && (
              <span className="ml-2 text-blue-600">
                • Resaltando: {selectedWord}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-14 gap-1 max-w-fit mx-auto">
            {matrix.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const positionKey = `${rowIndex}-${colIndex}`
                const isHighlighted = highlightedPositions.has(positionKey)
                
                return (
                  <div
                    key={positionKey}
                    className={`
                      w-8 h-8 flex items-center justify-center text-sm font-mono border
                      ${isHighlighted 
                        ? 'bg-yellow-200 border-yellow-400 text-yellow-800 font-bold' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }
                      transition-colors duration-200
                    `}
                  >
                    {cell}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
