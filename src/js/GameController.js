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
    this.gameState = new GameState(); // Начинаем с пустого состояния
    this.currentLevel = 1;
    this.selectedCharacterIndex = null;
    this.selectedCharacter = null;
    this.boardSize = this.gamePlay.boardSize; 
    this.maxScore = 0;
  }

  // Инициализация игры
  init() {
    // Попытка загрузить сохраненное состояние игры
    try {
      const loadedState = this.stateService.load();
      if (loadedState) {
        this.gameState = GameState.from(loadedState);
        this.currentLevel = this.gameState.currentLevel;
        this.maxScore = this.gameState.maxScore;

        // Рисуем интерфейс
        this.gamePlay.drawUi(getTheme(this.currentLevel));
        this.positionedCharacters = this.gameState.positionedCharacters;
        this.gamePlay.redrawPositions(this.positionedCharacters);
      } else {
        this.startNewGame(); // Если нет сохраненного состояния, начинаем новую игру
      }
    } catch (e) {
      console.warn('Не удалось загрузить игру, начинаем новую игру.');
      this.startNewGame();
    }

    // Устанавливаем слушатели
    this.subscribeToCellClick();
    this.gamePlay.addNewGameListener(this.startNewGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  // Game Over, New Game и статистика
  onNewGameClick() {
    this.currentLevel = 1;
    this.gameState.maxPoints = Math.max(this.gameState.maxPoints || 0, this.gameState.currentPoints || 0);
    this.gameState.currentPoints = 0;
    this.startNewGame();  // Перезапускаем игру
    console.log('Новая игра начата!');
  }

    // Метод для начала новой игры
    startNewGame() {
      this.positionedCharacters = [];
      this.currentLevel = 1;
      this.gameState = GameState.from({});
      this.playerTeam = generateTeam(playerClasses, 1, 2);
      this.enemyTeam = generateTeam(enemyClasses, 1, 2);
    
      // Сначала вызываем drawUi(), чтобы убедиться, что интерфейс создан
      this.gamePlay.drawUi(getTheme(this.currentLevel));
    
      // Затем вызываем positionCharacters() для размещения персонажей
      this.positionCharacters();
      this.maxScore = Math.max(this.maxScore, this.calculateScore());
    
      // Сохраняем обновленное состояние игры
      this.saveGameState();
      
      // Устанавливаем ход игрока
      this.gameState.currentTurn = 'player';
    }

  // метод подсчета очков
  calculateScore() {
    let score = 0;
    this.positionedCharacters.forEach((posChar) => {
      if (playerClasses.includes(posChar.character.constructor)) {
        score += posChar.character.health; 
      }
    });
    return score;
  }

    // Метод для сохранения состояния игры
  saveGameState() {
    try {
      // Формируем состояние игры для сохранения
      const gameState = GameState.from({
        currentLevel: this.currentLevel,
        currentTurn: this.gameState.currentTurn,
        positionedCharacters: this.positionedCharacters,
        maxScore: this.maxScore,
      });
  
      this.stateService.save(gameState);
      console.log('Состояние игры успешно сохранено:', gameState);
    } catch (e) {
      console.error('Ошибка при сохранении состояния игры:', e);
      GamePlay.showError('Не удалось сохранить игру.');
    }
  }

  // Метод для загрузки состояния игры
  loadGameState() {
    try {
      console.log('Попытка загрузки состояния игры...');
      const loadedState = this.stateService.load();
  
      if (!loadedState) {
        // Если состояние не было сохранено ранее или повреждено, начинаем новую игру
        console.warn('Сохраненное состояние отсутствует. Начинаем новую игру.');
        this.startNewGame();
        return;
      }
  
      // Применяем загруженное состояние
      if (typeof loadedState.currentLevel === 'number' && Array.isArray(loadedState.positionedCharacters)) {
        console.log('Состояние игры успешно загружено, применяем параметры...');
  
        this.currentLevel = loadedState.currentLevel;
        this.gameState.currentTurn = loadedState.currentTurn || 'player';
        this.positionedCharacters = loadedState.positionedCharacters;
        this.maxScore = loadedState.maxScore || 0;
  
        // Отрисовка интерфейса и персонажей
        this.gamePlay.drawUi(getTheme(this.currentLevel));
        this.gamePlay.redrawPositions(this.positionedCharacters);
        console.log('Интерфейс успешно отрисован.');
      } else {
        // Если данные не соответствуют ожиданиям, начинаем новую игру
        console.warn('Загруженные данные повреждены или невалидны. Начинаем новую игру.');
        this.startNewGame();
      }
    } catch (e) {
      console.error('Ошибка при загрузке сохраненного состояния:', e);
      GamePlay.showError('Не удалось загрузить игру. Начинаем новую игру.');
      this.startNewGame();
    }
  }
  
  
  
  

  // Подписка на событие клика по ячейке
  subscribeToCellClick() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  // Расстановка персонажей
  positionCharacters() {
    const playerPositions = this.generateUniquePositions([0, 1], this.playerTeam.characters.length);
    const enemyPositions = this.generateUniquePositions([6, 7], this.enemyTeam.characters.length);

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


  // Проверка доступности ячейки в радиусе (для атаки)
  isWithinRadius(currentPos, targetPos, radius) {
    const x1 = currentPos % 8;
    const y1 = Math.floor(currentPos / 8);
    const x2 = targetPos % 8;
    const y2 = Math.floor(targetPos / 8);
    const distance = Math.abs(x1 - x2) + Math.abs(y1 - y2); // Манхэттенское расстояние для учета радиуса
    return distance <= radius;
  }


  // Проверка допустимости перемещения (по прямой или диагонали)
  isValidMove(startPos, targetPos) {
    const x1 = startPos % 8;
    const y1 = Math.floor(startPos / 8);
    const x2 = targetPos % 8;
    const y2 = Math.floor(targetPos / 8);

    // Проверяем, что перемещение происходит по одной линии или по диагонали
    return (x1 === x2 || y1 === y2 || Math.abs(x1 - x2) === Math.abs(y1 - y2));
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
      const withinMoveRange = !character && this.isWithinRadius(this.selectedCharacter.position, index, this.getMoveRange(this.selectedCharacter.character)) && this.isValidMove(this.selectedCharacter.position, index);

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

        // Проверка, остались ли еще враги
        const enemiesLeft = this.positionedCharacters.some((posChar) => enemyClasses.includes(posChar.character.constructor));
        if (!enemiesLeft) {
            this.startNextLevel();
            return;
        }
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
      if (
        !positionedCharacter &&
        this.isWithinRadius(this.selectedCharacter.position, index, this.getMoveRange(selectedChar)) &&
        this.isValidMove(this.selectedCharacter.position, index)
      ) {
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

  generateUniquePositions(columns, count) {
    const positions = new Set();
    while (positions.size < count) {
        const position = Math.floor(Math.random() * 8) * 8 + columns[Math.floor(Math.random() * columns.length)];
        positions.add(position);
    }
    return Array.from(positions);
}

  // Метод calcRange для движения по прямым линиям и диагоналям
  calcRange(position, range) {
    const boardSize = this.boardSize; 
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
        if (
          (leftBorder.includes(position) && dx === -1 && x === boardSize - 1) ||
          (rightBorder.includes(position) && dx === 1 && x === 0)
        ) {
          break;
        }

        rangePositions.push(newPosition);
      }
    });

    return rangePositions;
  }


  // Метод для нахождения допустимых позиций для атаки
  findAllowedToAttack(position, type) {
    let attackRange;

    switch (type) {
      case 'swordsman':
      case 'undead':
        attackRange = 1;
        break;
      case 'bowman':
      case 'vampire':
        attackRange = 2;
        break;
      case 'magician':
      case 'daemon':
        attackRange = 4;
        break;
      default:
        attackRange = 1;
    }

    return this.calcRange(position, attackRange);
  }

  // логика поведения бота 
  computerAction() {
    this.gameState.currentTurn = 'comp';

    let attacker = null;
    let target = null;

    // Поиск цели для атаки
    this.positionedCharacters.forEach(botChar => {
      if (enemyClasses.includes(botChar.character.constructor)) {
        const allowedToAttack = this.findAllowedToAttack(botChar.position, botChar.character.constructor.name.toLowerCase());
        allowedToAttack.forEach(targetPos => {
          const playerChar = this.getCharacterAtPosition(targetPos);
          if (playerChar && playerClasses.includes(playerChar.character.constructor)) {
            attacker = botChar;
            target = playerChar;
          }
        });
      }
    });

    // Атака, если есть цель
    if (attacker && target) {
      console.log(`Компьютер атакует ${target.character.constructor.name} на позиции ${target.position}`);
      this.performAttack(attacker.character, target.character, target.position).then(() => {
        this.switchTurn();
      });
    } else {
      // Поиск ближайшей цели для движения
      let closestPlayer = null;
      let minDistance = Infinity;

      this.positionedCharacters.forEach(botChar => {
        if (enemyClasses.includes(botChar.character.constructor)) {
          this.positionedCharacters.forEach(playerChar => {
            if (playerClasses.includes(playerChar.character.constructor)) {
              const distance = Math.abs(playerChar.position % 8 - botChar.position % 8) +
                              Math.abs(Math.floor(playerChar.position / 8) - Math.floor(botChar.position / 8));
              if (distance < minDistance) {
                minDistance = distance;
                closestPlayer = playerChar;
                attacker = botChar;
              }
            }
          });
        }
      });

      // Выполнение движения
      if (closestPlayer && attacker) {
        const allowedMoves = this.calcRange(attacker.position, this.getMoveRange(attacker.character))
          .filter(move => !this.positionedCharacters.some(pc => pc.position === move) && this.isValidMove(attacker.position, move));

        if (allowedMoves.length > 0) {
          const targetMove = allowedMoves[Math.floor(Math.random() * allowedMoves.length)];
          console.log(`Компьютер перемещает ${attacker.character.constructor.name} на позицию ${targetMove}`);
          attacker.position = targetMove;
          this.gamePlay.redrawPositions(this.positionedCharacters);
          this.switchTurn();
        }
      }
    }
  }

  
    // Метод для повышения уровня персонажа
  levelUp(character) {
    character.level += 1;
    character.attack = Math.max(character.attack, character.attack * (80 + character.health) / 100);
    character.defence = Math.max(character.defence, character.defence * (80 + character.health) / 100);
    character.health = Math.min(100, character.health + 80);
  }

  // Метод для начала нового уровня игры
  startNextLevel() {
    this.currentLevel += 1;

    // Изменяем тему игры
    this.gamePlay.drawUi(getTheme(this.currentLevel));

    // Повышаем уровень всех оставшихся персонажей игрока
    this.positionedCharacters.forEach((posChar) => {
      if (playerClasses.includes(posChar.character.constructor)) {
        this.levelUp(posChar.character);
      }
    });

    // Генерируем новую команду противника с увеличенной сложностью
    const newEnemyTeam = generateTeam(enemyClasses, this.currentLevel, this.currentLevel + 1);
    const enemyPositions = this.generateUniquePositions([6, 7], newEnemyTeam.characters.length);
    const newEnemyCharacters = newEnemyTeam.characters.map((character, index) => new PositionedCharacter(character, enemyPositions[index]));

    // Генерируем нового персонажа для игрока
    const newPlayerTeam = generateTeam(playerClasses, this.currentLevel, 1);
    const newPlayerPositions = this.generateUniquePositions([0, 1], newPlayerTeam.characters.length);
    const newPlayerCharacters = newPlayerTeam.characters.map((character, index) => new PositionedCharacter(character, newPlayerPositions[index]));

    // Обновляем список персонажей, добавляя новых врагов и нового игрока к уже существующим персонажам игрока
    this.positionedCharacters = [
      ...this.positionedCharacters.filter((posChar) => playerClasses.includes(posChar.character.constructor)),
      ...newPlayerCharacters,
      ...newEnemyCharacters
    ];

    this.gamePlay.redrawPositions(this.positionedCharacters);

    // Переключаем ход на игрока
    this.gameState.currentTurn = 'player';
    console.log(`Новый уровень ${this.currentLevel} начат!`);

    // Сохраняем текущее состояние игры
    this.saveGameState();
}

}
