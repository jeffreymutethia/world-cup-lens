export class AuthoringMatchNotFoundError extends Error {
  constructor() {
    super('Match not found');
    this.name = 'AuthoringMatchNotFoundError';
  }
}
