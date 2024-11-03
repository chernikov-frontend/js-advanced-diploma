import GameController from '../GameController';
import Swordsman from '../characters/Swordsman';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';

describe('GameController - getAvailableMoves', () => {
    let gameController;
  
    beforeEach(() => {
      gameController = new GameController(null, null);
      gameController.positionedCharacters = []; // Инициализация пустого массива
    });
  
    test('Мечник/Скелет - движение на 4 клетки по прямым и диагоналям', () => {
      const swordsman = new Swordsman(1);
      const position = 27;
      const expectedMoves = [
        31, 35, 39, 23, 19, 15, 11,  // вправо-влево
        35, 43, 51, 59, 19, 11, 3,    // вверх-вниз
        34, 41, 48, 55, 20, 13, 6, 0  // диагонали
      ];
  
      const moves = gameController.getAvailableMoves(position, swordsman);
      expect(moves.sort()).toEqual(expectedMoves.sort());
    });
  
    test('Лучник/Вампир - движение на 2 клетки по прямым и диагоналям', () => {
      const bowman = new Bowman(1);
      const position = 27;
      const expectedMoves = [
        29, 31, 25, 23, // вправо-влево
        35, 43, 19, 11, // вверх-вниз
        34, 41, 20, 13  // диагонали
      ];
  
      const moves = gameController.getAvailableMoves(position, bowman);
      expect(moves.sort()).toEqual(expectedMoves.sort());
    });
  
    test('Маг/Демон - движение на 1 клетку по прямым и диагоналям', () => {
      const magician = new Magician(1);
      const position = 27;
      const expectedMoves = [
        28, 26, 35, 19, 34, 20, 25, 29 // все направления
      ];
  
      const moves = gameController.getAvailableMoves(position, magician);
      expect(moves.sort()).toEqual(expectedMoves.sort());
    });
  
    test('Проверка корректности на краю поля', () => {
      const swordsman = new Swordsman(1);
      const position = 0;
      const expectedMoves = [
        1, 2, 8, 16, 9, 17 // доступные по прямым и диагоналям на краю
      ];
  
      const moves = gameController.getAvailableMoves(position, swordsman);
      expect(moves.sort()).toEqual(expectedMoves.sort());
    });
  });