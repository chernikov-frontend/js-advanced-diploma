export default class Team {
  constructor(characters = []) {
    this.characters = characters;
  }

  addCharacter(character) {
    this.characters.push(character);
  }
}


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
