// src/js/__tests__/computerAction.test.js

import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';

// Мок для GamePlay
jest.mock('../GamePlay');

describe('GameController computerAction method', () => {
  let gameController;
  let gamePlayMock;

  beforeEach(() => {
    gamePlayMock = new GamePlay();
    gameController = new GameController(gamePlayMock);
    gameController.positionedCharacters = [
      new PositionedCharacter(new Swordsman(), 0), // Игрок на позиции 0
      new PositionedCharacter(new Undead(), 8),    // Компьютер на позиции 8
    ];
  });

  test('Компьютер атакует игрока, если тот находится в зоне атаки', async () => {
    const playerCharacter = gameController.positionedCharacters[0];
    const computerCharacter = gameController.positionedCharacters[1];
    
    jest.spyOn(gameController, 'getAttackRange').mockReturnValue(1);
    jest.spyOn(gameController, 'isWithinRadius').mockImplementation((start, end) => start === 8 && end === 0);
    jest.spyOn(gameController, 'performAttack').mockResolvedValue();
    jest.spyOn(gameController, 'switchTurn').mockImplementation(() => {
      gameController.gameState.currentTurn = 'player';
    });

    await gameController.computerAction();

    expect(gameController.performAttack).toHaveBeenCalledWith(
      computerCharacter.character,
      playerCharacter.character,
      playerCharacter.position
    );
    expect(gameController.switchTurn).toHaveBeenCalled();
  });

  test('Компьютер перемещается ближе к игроку, если атака невозможна', () => {
    const playerCharacter = gameController.positionedCharacters[0];
    const computerCharacter = gameController.positionedCharacters[1];

    // Настраиваем mock для радиуса атаки и проверки позиции
    jest.spyOn(gameController, 'getAttackRange').mockReturnValue(1);
    jest.spyOn(gameController, 'isWithinRadius').mockReturnValue(false);
    jest.spyOn(gameController, 'switchTurn');

    gameController.computerAction();

    // Определяем ожидаемую целевую позицию, куда должен переместиться компьютерный персонаж
    const expectedTargetPosition = 1;
    
    // Проверяем, что персонаж переместился ближе к игроку и был вызван switchTurn
    expect(computerCharacter.position).toBe(expectedTargetPosition);
    expect(gamePlayMock.redrawPositions).toHaveBeenCalledWith(gameController.positionedCharacters);
    expect(gameController.switchTurn).toHaveBeenCalled();
  });
});

