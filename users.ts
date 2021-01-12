export class User {
  constructor(public email: string, public name: string, private password: string) {}

  matches(another: User): boolean {
    return another !== undefined && another.email === this.email && another.password === this.password;
  }
}

export const users: { [key: string]: User } = {
  'jureg@gmail.com': new User('jureg@gmail.com', 'jureg', '12345'),
  'gabriel@gmail.com': new User('gabriel@gmail.com', 'gabriel', '12345'),
};
