import GamePlay from './GamePlay';
import { generateTeam, playerClasses, enemyClasses } from './generators';
import PositionedCharacter from './PositionedCharacter';
import { getTheme } from './themes';
import GameState from './GameState';
import cursors from './cursors';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Bowman from './characters/Bowman';
import Vampire from './characters/Vampire';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = GameState.from({});
    this.currentLevel = 1;
    this.selectedCharacterIndex = null;
    this.selectedCharacter = null; // Для хранения выбранного персонажа
  }

  // Инициализация игры
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

  // Подписка на событие клика по ячейке
  subscribeToCellClick() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  // Расстановка персонажей
  positionCharacters() {
    const playerPositions = this.generateUniquePositions([0, 1]);
    const enemyPositions = this.generateUniquePositions([6, 7]);

    this.positionedCharacters = [
      ...this.playerTeam.characters.map((character, index) => new PositionedCharacter(character, playerPositions[index])),
      ...this.enemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index])),
    ];

    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  // Определение диапазона перемещения
  getMoveRange(character) {
    if (character instanceof Swordsman || character instanceof Undead) return 4;
    if (character instanceof Bowman || character instanceof Vampire) return 2;
    if (character instanceof Magician || character instanceof Daemon) return 1;
    return 1;
  }

  // Определение диапазона атаки
  getAttackRange(character) {
    if (character instanceof Swordsman || character instanceof Undead) return 1;
    if (character instanceof Bowman || character instanceof Vampire) return 2;
    if (character instanceof Magician || character instanceof Daemon) return 4;
    return 1;
  }

  // Проверка доступности ячейки в радиусе
  isWithinRadius(currentPos, targetPos, radius) {
    const x1 = currentPos % 8;
    const y1 = Math.floor(currentPos / 8);
    const x2 = targetPos % 8;
    const y2 = Math.floor(targetPos / 8);
    const distance = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    return distance <= radius;
  }

  // Обработка клика по ячейке
  onCellClick(index) {
    const character = this.getCharacterAtPosition(index);

    // Если клик по ячейке с персонажем игрока — выделение
    if (character && playerClasses.includes(character.character.constructor)) {
        // Снимаем выделение с предыдущего выбранного персонажа
        if (this.selectedCharacterIndex !== null) {
            this.gamePlay.deselectCell(this.selectedCharacterIndex);
        }

        // Выделяем нового персонажа
        this.gamePlay.selectCell(index);
        this.selectedCharacterIndex = index;
        this.selectedCharacter = character;

    } else if (this.selectedCharacter) {
        const withinAttackRange = character && enemyClasses.includes(character.character.constructor) && this.isWithinRadius(this.selectedCharacter.position, index, this.getAttackRange(this.selectedCharacter.character));
        const withinMoveRange = !character && this.isWithinRadius(this.selectedCharacter.position, index, this.getMoveRange(this.selectedCharacter.character));

        // Атака
        if (withinAttackRange) {
            this.performAttack(this.selectedCharacter.character, character.character, index).then(() => {
                this.switchTurn();
            });
        }
        // Перемещение
        else if (withinMoveRange) {
            this.moveCharacter(index);
            this.switchTurn();
        }
        // Недопустимое действие
        else {
            GamePlay.showError('Выберите доступного для перемещения или атаки персонажа');
        }
    } else {
        GamePlay.showError('Выберите своего персонажа для начала хода');
    }
  }

  // Выполнение атаки
  async performAttack(attacker, target, targetIndex) {
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    target.health -= damage;

    // Вызов статического метода для анимации урона
    await this.gamePlay.showDamage(targetIndex, damage);

    if (target.health <= 0) {
        this.positionedCharacters = this.positionedCharacters.filter(
            (posChar) => posChar.character !== target
        );
        console.log(`Персонаж на позиции ${targetIndex} побежден и удален с поля`);
    }

    this.gamePlay.redrawPositions(this.positionedCharacters);
    return Promise.resolve();  // Обеспечиваем возврат Promise для совместимости
  }

  // Переключение хода
  switchTurn() {
    this.gameState.currentTurn = this.gameState.currentTurn === 'player' ? 'computer' : 'player';
    console.log(`Ход перешел к ${this.gameState.currentTurn}`);
    if (this.gameState.currentTurn === 'computer') {
        this.computerAction();
    }
  }

  // Наведение на ячейку
  onCellEnter(index) {
    const positionedCharacter = this.getCharacterAtPosition(index);

    // Отображение информации о персонаже при наведении
    if (positionedCharacter) {
        const tooltipMessage = this.createCharacterTooltip(positionedCharacter.character);
        this.gamePlay.showCellTooltip(tooltipMessage, index);
    }

    if (this.selectedCharacter) {
        const selectedChar = this.selectedCharacter.character;

        // Если наведено на врага в радиусе атаки - курсор crosshair, подсветка красная
        if (
            positionedCharacter &&
            enemyClasses.includes(positionedCharacter.character.constructor) &&
            this.isWithinRadius(this.selectedCharacter.position, index, this.getAttackRange(selectedChar))
        ) {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red');
            return;
        }

        // Если наведено на пустую ячейку в радиусе перемещения - курсор pointer, подсветка зелёная
        if (!positionedCharacter && this.isWithinRadius(this.selectedCharacter.position, index, this.getMoveRange(selectedChar))) {
            this.gamePlay.setCursor(cursors.pointer);
            this.gamePlay.selectCell(index, 'green');
            return;
        }

        // Недопустимое действие - курсор notallowed
        this.gamePlay.setCursor(cursors.notallowed);
    } else {
        // Если персонаж игрока не выбран, но наведено на дружественного персонажа - курсор pointer
        if (positionedCharacter && playerClasses.includes(positionedCharacter.character.constructor)) {
            this.gamePlay.setCursor(cursors.pointer);
        } else {
            this.gamePlay.setCursor(cursors.notallowed);
        }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);

    // Снятие подсветки, если ячейка не выбрана как персонаж
    if (this.selectedCharacterIndex !== index) {
        this.gamePlay.deselectCell(index);
    }
  }

  moveCharacter(newPosition) {
    this.selectedCharacter.position = newPosition;
    this.gamePlay.deselectCell(this.selectedCharacterIndex);
    this.selectedCharacterIndex = null;
    this.selectedCharacter = null;
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  getCharacterAtPosition(index) {
    return this.positionedCharacters.find((posChar) => posChar.position === index);
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

// Метод calcRange для движения по прямым линиям и диагоналям
calcRange(position, range) {
  const boardSize = this.gamePlay.boardSize;
  const rangePositions = [];
  const leftBorder = [...Array(boardSize).keys()].map(i => i * boardSize);
  const rightBorder = [...Array(boardSize).keys()].map(i => (i * boardSize) + boardSize - 1);

  const directions = [
    { dx: 1, dy: 0 },   // вправо
    { dx: -1, dy: 0 },  // влево
    { dx: 0, dy: 1 },   // вниз
    { dx: 0, dy: -1 },  // вверх
    { dx: 1, dy: 1 },   // вправо-вниз (диагональ)
    { dx: -1, dy: -1 }, // влево-вверх (диагональ)
    { dx: 1, dy: -1 },  // вправо-вверх (диагональ)
    { dx: -1, dy: 1 }   // влево-вниз (диагональ)
  ];

  directions.forEach(({ dx, dy }) => {
    for (let step = 1; step <= range; step++) {
      const x = (position % boardSize) + dx * step;
      const y = Math.floor(position / boardSize) + dy * step;

      // Проверка на выход за границы поля
      if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) break;

      const newPosition = y * boardSize + x;

      // Прерываем движение, если пересекаем границы
      if ((leftBorder.includes(position) && dx === -1) || 
          (rightBorder.includes(position) && dx === 1)) {
        break;
      }

      rangePositions.push(newPosition);
    }
  });

  return rangePositions;
}

// Обновленный метод computerAction с учетом calcRange и фильтрацией занятых позиций
computerAction() {
  const botCharacters = this.positionedCharacters.filter(pc =>
      enemyClasses.includes(pc.character.constructor));
  const playerCharacters = this.positionedCharacters.filter(pc =>
      playerClasses.includes(pc.character.constructor));

  for (const bot of botCharacters) {
    for (const player of playerCharacters) {
      if (this.isWithinRadius(bot.position, player.position, this.getAttackRange(bot.character))) {
        console.log(`Компьютер атакует ${player.character.constructor.name} на позиции ${player.position}`);
        this.performAttack(bot.character, player.character, player.position).then(() => {
          this.switchTurn();
        });
        return;
      }
    }
  }

  for (const bot of botCharacters) {
    let closestPlayer = null;
    let minDistance = Infinity;

    for (const player of playerCharacters) {
      const distance = Math.abs(player.position % 8 - bot.position % 8) +
                       Math.abs(Math.floor(player.position / 8) - Math.floor(bot.position / 8));
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    }

    if (closestPlayer) {
      const botMoves = this.calcRange(bot.position, this.getMoveRange(bot.character))
          .filter(move => !this.positionedCharacters.some(pc => pc.position === move));

      const targetMove = botMoves.find(move =>
          this.isWithinRadius(move, closestPlayer.position, this.getMoveRange(bot.character))
      );

      if (targetMove !== undefined) {
        console.log(`Компьютер перемещает ${bot.character.constructor.name} на позицию ${targetMove}`);
        bot.position = targetMove;
        this.gamePlay.redrawPositions(this.positionedCharacters);
        this.switchTurn();
        return;
      }
    }
  }
}

  }
  
