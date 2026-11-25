
#include <stdio.h>
#include <stdlib.h>
#include "puzzle.h"
#include <emscripten/emscripten.h>

#define MAX_CELLS 64

int board[MAX_CELLS];
int gridSize = 4;
int totalMoves = 0;

// Find empty cell
int findEmpty()
{
    int totalCells = gridSize * gridSize;

    for (int i = 0; i < totalCells; i++)
    {
        if (board[i] == 0)
            return i;
    }

    return -1;
}

// Initialize puzzle
EMSCRIPTEN_KEEPALIVE
void initPuzzle(int size, unsigned int seed)
{
    if (size < 3 || size > 8)
        size = 4;

    gridSize = size;

    int totalCells = gridSize * gridSize;

    // Arrange numbers in correct order
    for (int i = 0; i < totalCells; i++)
    {
        board[i] = (i == totalCells - 1) ? 0 : i + 1;
    }

    totalMoves = 0;

    srand(seed);

    int previousEmpty = -1;

    // Shuffle through valid moves
    for (int i = 0; i < 1000; i++)
    {
        int empty = findEmpty();

        int possible[4];
        int count = 0;

        int row = empty / gridSize;
        int col = empty % gridSize;

        if (row > 0)
            possible[count++] = empty - gridSize;

        if (row < gridSize - 1)
            possible[count++] = empty + gridSize;

        if (col > 0)
            possible[count++] = empty - 1;

        if (col < gridSize - 1)
            possible[count++] = empty + 1;

        int candidates[4];
        int candidateCount = 0;

        for (int j = 0; j < count; j++)
        {
            if (possible[j] != previousEmpty || count == 1)
            {
                candidates[candidateCount++] = possible[j];
            }
        }

        int selected = candidates[rand() % candidateCount];

        board[empty] = board[selected];
        board[selected] = 0;

        previousEmpty = empty;
    }

    // Prevent an already solved starting board
    if (isSolved())
    {
        int empty = findEmpty();

        int neighbor = (empty % gridSize == 0)
                       ? empty + 1
                       : empty - 1;

        board[empty] = board[neighbor];
        board[neighbor] = 0;
    }
}

// Move selected tile
EMSCRIPTEN_KEEPALIVE
int moveTile(int index)
{
    int totalCells = gridSize * gridSize;

    if (index < 0 || index >= totalCells)
        return 0;

    int empty = findEmpty();

    int tileRow = index / gridSize;
    int tileCol = index % gridSize;

    int emptyRow = empty / gridSize;
    int emptyCol = empty % gridSize;

    int distance =
        abs(tileRow - emptyRow) +
        abs(tileCol - emptyCol);

    // Only adjacent tiles can move
    if (distance != 1)
        return 0;

    // Swap
    board[empty] = board[index];
    board[index] = 0;

    totalMoves++;

    return 1;
}

// Get tile number
EMSCRIPTEN_KEEPALIVE
int getTile(int index)
{
    int totalCells = gridSize * gridSize;

    if (index < 0 || index >= totalCells)
        return -1;

    return board[index];
}

// Get moves
EMSCRIPTEN_KEEPALIVE
int getMoves(void)
{
    return totalMoves;
}

// Get grid size
EMSCRIPTEN_KEEPALIVE
int getSize(void)
{
    return gridSize;
}

// Check winning condition
EMSCRIPTEN_KEEPALIVE
int isSolved(void)
{
    int totalCells = gridSize * gridSize;

    for (int i = 0; i < totalCells - 1; i++)
    {
        if (board[i] != i + 1)
            return 0;
    }

    return board[totalCells - 1] == 0;
}
