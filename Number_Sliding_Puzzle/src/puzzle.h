
#ifndef PUZZLE_H
#define PUZZLE_H

void initPuzzle(int size, unsigned int seed);
int moveTile(int index);
int getTile(int index);
int getMoves(void);
int getSize(void);
int isSolved(void);

#endif
