// export default class Team {
//   constructor(characters) {
//     this.characters = characters; // Массив объектов персонажей
//   }

//   get allCharacters() {
//     return this.characters;
//   }
// }

export default class Team {
  constructor(characters = []) {
    this.characters = characters;
  }

  addCharacter(character) {
    this.characters.push(character);
  }
}








// export default class Team {
//   constructor() {
//     this._characters = [];
//   }

//   add(character) {
//     if (!(character instanceof Character)) { // Предположим, что есть базовый класс Character
//       throw new Error('Некорректный персонаж');
//     }
//     this._characters.push(character);
//   }

//   get characters() {
//     return [...this._characters]; // Возвращаем копию массива, чтобы предотвратить изменение оригинального списка извне
//   }
// }







/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
//  * ```js
//  * const characters = [new Swordsman(2), new Bowman(1)]
//  * const team = new Team(characters);
//  *
//  * team.characters // [swordsman, bowman]
//  * ```
//  * */
// export default class Team {
//   // TODO: write your logic here
// }
