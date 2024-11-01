// src/js/GameController.js
import { generateTeam, playerClasses, enemyClasses } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { getTheme } from './themes';
import GameState from './GameState';
import GamePlay from './GamePlay'

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = GameState.from({});
    this.currentLevel = 1;
    this.selectedCharacterIndex = null;
  }

  init() {
    this.gameState.currentTurn = 'player';
    this.gamePlay.drawUi(getTheme(this.currentLevel));
    this.playerTeam = generateTeam(playerClasses, 1, 2);
    this.enemyTeam = generateTeam(enemyClasses, 1, 2);
    this.positionCharacters();

    // Подписка на событие клика по ячейке
    this.subscribeToCellClick();
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  // Метод для подписки на событие клика по ячейке
  subscribeToCellClick() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this)); // Привязка onCellClick к контексту GameController
  }

  positionCharacters() {
    const playerPositions = this.generateUniquePositions([0, 1]);
    const enemyPositions = this.generateUniquePositions([6, 7]);

    this.positionedCharacters = [
      ...this.playerTeam.characters.map((character, index) => new PositionedCharacter(character, playerPositions[index])),
      ...this.enemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index]))
    ];

    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  onCellClick(index) {
    const character = this.getCharacterAtPosition(index);

    // Проверка, есть ли персонаж игрока в ячейке
    if (character && playerClasses.includes(character.character.constructor)) {
      // Снимаем выделение с предыдущего персонажа, если он был выделен
      if (this.selectedCharacterIndex !== null) {
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
      }

      // Выделяем текущую ячейку и сохраняем ее индекс
      this.gamePlay.selectCell(index);
      this.selectedCharacterIndex = index;
    } else {
      // Показ сообщения об ошибке, если выбран не персонаж игрока или пустая ячейка
      GamePlay.showError('Выберите своего персонажа для начала хода');
    }
  }

  onCellEnter(index) {
    const positionedCharacter = this.getCharacterAtPosition(index);
    if (positionedCharacter) {
      const tooltipMessage = this.createCharacterTooltip(positionedCharacter.character);
      this.gamePlay.showCellTooltip(tooltipMessage, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }

  getCharacterAtPosition(index) {
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
