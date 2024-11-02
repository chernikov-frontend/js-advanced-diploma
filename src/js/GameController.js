import GamePlay from './GamePlay';
import { generateTeam, playerClasses, enemyClasses } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { getTheme } from './themes';
import GameState from './GameState';
import cursors from './cursors';
import { isMoveAllowed, isAttackAllowed } from './characterUtils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = GameState.from({});
    this.currentLevel = 1;
    this.selectedCharacterIndex = null;
    this.selectedCharacter = null; // Добавлено для хранения выбранного персонажа
  }

  init() {
    this.gameState.currentTurn = 'player';
    this.gamePlay.drawUi(getTheme(this.currentLevel));
    this.playerTeam = generateTeam(playerClasses, 1, 2);
    this.enemyTeam = generateTeam(enemyClasses, 1, 2);
    this.positionCharacters();

    this.subscribeToCellClick();
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  // Метод для подписки на событие клика по ячейке
  subscribeToCellClick() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  positionCharacters() {
    const playerPositions = this.generateUniquePositions([0, 1]);
    const enemyPositions = this.generateUniquePositions([6, 7]);

    this.positionedCharacters = [
      ...this.playerTeam.characters.map((character, index) => new PositionedCharacter(character, playerPositions[index])),
      ...this.enemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index])),
    ];

    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  onCellClick(index) {
    const character = this.getCharacterAtPosition(index);
  
    // Если клик по ячейке с персонажем игрока — выделение
    if (character && playerClasses.includes(character.character.constructor)) {
      if (this.selectedCharacterIndex !== null) {
        this.gamePlay.deselectCell(this.selectedCharacterIndex); // Снятие выделения с предыдущего персонажа
      }
  
      this.gamePlay.selectCell(index); // Выделение нового персонажа
      this.selectedCharacterIndex = index; // Обновление индекса выбранного персонажа
      this.selectedCharacter = character; // Сохраняем объект выбранного персонажа
  
    // Если выбранная ячейка доступна для атаки и содержит противника, выполняем атаку
    } else if (
      this.selectedCharacter &&
      character && // Проверка, что целевая ячейка содержит персонажа
      enemyClasses.includes(character.character.constructor) &&
      isAttackAllowed(this.selectedCharacter.character, this.selectedCharacter.position, index)
    ) {
      this.performAttack(this.selectedCharacter.character, character.character, index); // Выполняем атаку
      this.switchTurn(); // Переключаем ход
  
    // Если выбранная ячейка доступна для перемещения и свободна, передвигаем персонажа
    } else if (
      this.selectedCharacter &&
      !character && // Проверка, что ячейка пуста
      isMoveAllowed(this.selectedCharacter.character, this.selectedCharacter.position, index)
    ) {
      this.moveCharacter(index); // Перемещаем персонажа
      this.switchTurn(); // Переключаем ход
  
    } else {
      GamePlay.showError('Выберите доступного для перемещения или атаки персонажа');
    }
  }

  // Метод для выполнения атаки
  async performAttack(attacker, target, targetIndex) {
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    target.health -= damage;

    // Отображение урона с анимацией и ожидание завершения
    await this.gamePlay.showDamage(targetIndex, damage);

    // Если цель погибла, удаляем её из команды
    if (target.health <= 0) {
      this.positionedCharacters = this.positionedCharacters.filter(
        (positionedCharacter) => positionedCharacter.character !== target
      );
    }

    // Обновляем поле после атаки
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  onCellEnter(index) {
    const positionedCharacter = this.getCharacterAtPosition(index);
  
    // Если наведена ячейка с персонажем, показываем подсказку с характеристиками
    if (positionedCharacter) {
      const tooltipMessage = this.createCharacterTooltip(positionedCharacter.character);
      this.gamePlay.showCellTooltip(tooltipMessage, index);
    }
  
    // Определение действия при наведении
    if (positionedCharacter && playerClasses.includes(positionedCharacter.character.constructor)) {
      // Наведен персонаж игрока - курсор "pointer" для выбора
      this.gamePlay.setCursor(cursors.pointer);
    } else if (
      this.selectedCharacterIndex !== null &&
      positionedCharacter && // Проверка на наличие противника
      enemyClasses.includes(positionedCharacter.character.constructor) && // Проверка, что это противник
      isAttackAllowed(this.selectedCharacter.character, this.selectedCharacter.position, index) // В радиусе атаки
    ) {
      // Подсвечиваем красным и устанавливаем курсор для атаки
      this.gamePlay.setCursor(cursors.crosshair);
      this.gamePlay.selectCell(index, 'red');
    } else if (
      this.selectedCharacterIndex !== null &&
      isMoveAllowed(this.selectedCharacter.character, this.selectedCharacter.position, index)
    ) {
      // Если ячейка доступна для перемещения - подсвечиваем зеленым и устанавливаем курсор "pointer"
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } else {
      // Иначе недоступное действие - курсор "notallowed"
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index); // Скрытие подсказки при уходе с ячейки
    this.gamePlay.deselectCell(index); // Снятие подсветки ячейки
  }

  // Метод для перемещения персонажа
  moveCharacter(newPosition) {
    this.selectedCharacter.position = newPosition; // Обновляем позицию персонажа
    this.gamePlay.deselectCell(this.selectedCharacterIndex); // Снимаем выделение
    this.selectedCharacterIndex = null;
    this.selectedCharacter = null;
    this.gamePlay.redrawPositions(this.positionedCharacters); // Перерисовываем позиции
  }

  // Переключение хода
  switchTurn() {
    this.gameState.currentTurn = this.gameState.currentTurn === 'player' ? 'computer' : 'player';
  }

  getCharacterAtPosition(index) {
    return this.positionedCharacters.find((positionedCharacter) => positionedCharacter.position === index);
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
