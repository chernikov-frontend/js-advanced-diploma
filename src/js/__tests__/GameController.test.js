// src/js/__tests__/GameController.test.js
import GameController from '../GameController';
import GamePlay from '../GamePlay';

// Мок для gamePlay
jest.mock('../GamePlay');

// Подготовка данных для теста
    const mockCharacter = {
    level: 3,
    attack: 40,
    defence: 10,
    health: 100,
};

// Ожидаемый результат для вывода информации о персонаже
const expectedTooltip = '🎖 3 ⚔ 40 🛡 10 ❤ 100';

describe('GameController createCharacterTooltip', () => {
    let gameController;

    beforeEach(() => {
        // Инициализируем GameController с мок-объектом GamePlay
        gameController = new GameController(new GamePlay());
    });

    test('должен корректно формировать строку с характеристиками персонажа', () => {
        const tooltip = gameController.createCharacterTooltip(mockCharacter);
        expect(tooltip).toBe(expectedTooltip);
    });
});
