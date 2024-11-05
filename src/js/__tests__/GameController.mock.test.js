import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import Bowman from '../characters/Bowman';
import PositionedCharacter from '../PositionedCharacter';

jest.mock('../GamePlay');
jest.mock('../GameStateService');


describe('Тестирование загрузки и сохранения состояния игры в GameController', () => {
  let gamePlay;
  let gameStateService;
  let gameController;

  beforeEach(() => {
    gamePlay = new GamePlay();
    gameStateService = new GameStateService();
    gameController = new GameController(gamePlay, gameStateService);
  });

  test('должен корректно загружать сохраненное состояние', () => {
    gameStateService.load = jest.fn(() => ({
      currentLevel: 2,
      currentTurn: 'player',
      positionedCharacters: [
        {
          character: {
            type: 'Bowman',
            level: 1,
            attack: 25,
            defence: 25,
            health: 50,
          },
          position: 10,
        },
      ],
      maxScore: 50
    }));
    
    gameController.loadGameState();
    expect(gameController.currentLevel).toBe(2);
    expect(gameController.maxScore).toBe(50);
    expect(gameController.positionedCharacters.length).toBe(1);
  });

  test('должен корректно обрабатывать ошибку при загрузке', () => {
    gameStateService.load = jest.fn(() => {
      throw new Error('Load failed');
    });
  
    gameController.loadGameState();
    expect(GamePlay.showError).toHaveBeenCalledWith('Не удалось загрузить игру. Начинаем новую игру.');
  });

  test('Загрузка игры с некорректным состоянием', () => {
    const invalidState = {
      currentLevel: 'invalid',
    };
    gameStateService.load.mockReturnValue(invalidState);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    gameController.init();

    expect(consoleWarnSpy).toHaveBeenCalledWith('Загруженные данные отсутствуют или имеют неверный формат. Начинаем новую игру.');
    expect(gamePlay.drawUi).toHaveBeenCalled();
  });

  test('Успешное сохранение состояния игры', () => {
    gameController.currentLevel = 2;
    gameController.gameState.currentTurn = 'computer';
    gameController.positionedCharacters = [
      new PositionedCharacter(new Bowman(1), 10),
    ];
    gameController.maxScore = 200;

    gameController.saveGameState();

    expect(gameStateService.save).toHaveBeenCalledWith(expect.objectContaining({
      currentLevel: 2,
      currentTurn: 'computer',
      maxScore: 200,
      positionedCharacters: expect.arrayContaining([
        expect.objectContaining({
          character: expect.objectContaining({
            type: 'Bowman',
            level: 1,
            attack: 25,
            defence: 25,
            health: 50,
          }),
          position: 10,
        }),
      ]),
    }));
  });

  test('Неуспешное сохранение состояния игры', () => {
    gameStateService.save.mockImplementation(() => {
      throw new Error('Ошибка сохранения');
    });
    const showErrorSpy = jest.spyOn(GamePlay, 'showError');

    gameController.saveGameState();

    expect(showErrorSpy).toHaveBeenCalledWith('Не удалось сохранить игру.');
  });
});
