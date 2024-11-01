// src/js/GameController.js
import { generateTeam, playerClasses, enemyClasses } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { getTheme } from './themes';

export default class GameController {
  constructor(gamePlay) {
    this.gamePlay = gamePlay;
    this.currentLevel = 1; // Начальный уровень
  }

  init() {
    this.gamePlay.drawUi(getTheme(this.currentLevel)); // Устанавливаем тему для поля

    this.playerTeam = generateTeam(playerClasses, 1, 2); // Генерация команд
    this.enemyTeam = generateTeam(enemyClasses, 1, 2);

    this.positionCharacters();

    // Подключение обработчиков событий
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  positionCharacters() {
    // Получаем уникальные позиции для персонажей игроков и врагов
    const playerPositions = this.generateUniquePositions([0, 1]);
    const enemyPositions = this.generateUniquePositions([6, 7]);

    // Создаем массив с объектами PositionedCharacter для игроков и врагов
    this.positionedCharacters = [
      ...this.playerTeam.characters.map((character, index) => new PositionedCharacter(character, playerPositions[index])),
      ...this.enemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index]))
    ];

    // Перерисовываем позиции на игровом поле
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  onCellEnter(index) {
    const positionedCharacter = this.getCharacterAtPosition(index);
    if (positionedCharacter) {
      const tooltipMessage = this.createCharacterTooltip(positionedCharacter.character);
      this.gamePlay.showCellTooltip(tooltipMessage, index); // Отображаем информацию о персонаже
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index); // Скрытие информации о персонаже
  }

  getCharacterAtPosition(index) {
    // Ищем персонажа на позиции, используя positionedCharacters
    return this.positionedCharacters.find(positionedCharacter => positionedCharacter.position === index);
  }

  createCharacterTooltip(character) {
    return `🎖 ${character.level} ⚔ ${character.attack} 🛡 ${character.defence} ❤ ${character.health}`;
  }

  generateUniquePositions(columns) {
    const positions = new Set();
    while (positions.size < 2) {
      const position = Math.floor(Math.random() * 8) * 8 + columns[Math.floor(Math.random() * columns.length)];
      positions.add(position);
    }
    return Array.from(positions);
  }
}
