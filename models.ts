export class User {
  constructor(public id: number, public email: string, public name: string, public password: string, public role: string) {}
}

export class Token {
  constructor(public value: string, public userId: number) {}
}